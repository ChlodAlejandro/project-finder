import fs from "fs/promises";
import CrawlDirectory from "./crawl/CrawlDirectory";
import path from "path";
import {Detector} from "./detectors/detector";
import type {Project} from "./project";
import {Tagger} from "./taggers/tagger";

interface CrawledDirectory {
    [ key: string ]: Project | CrawledDirectory;
}

(async() => {

    // Load all detectors.
    const detectors: Detector[] = [];
    const detectorDir = await fs.opendir(path.join(__dirname, "detectors"));
    for await (const dirent of detectorDir) {
        if (!dirent.isFile() || dirent.name.endsWith(".d.ts")) {
            continue;
        }
        const detector = (await import(path.join(__dirname, "detectors", dirent.name))).default;

        if (detector.name && detector.onDir) {
            Object.assign(detector, {
                priority: detector.priority ?? 0,
                detectPriority: detector.detectPriority ?? 0,
                last: detector.last ?? false,
                crawlSubdirectories: detector.crawlSubdirectories ?? true
            });

            detectors.push(detector);
            // console.log(`Loaded detector: ${detector.name}`);
        } else {
            console.error(`Invalid detector: ${detector.name} (${dirent.name})`);
        }
    }
    detectors.sort(
        (a, b) =>
            (b.priority ?? 0) - (a.priority ?? 0) || a.name.localeCompare(b.name)
    );

    // Load all taggers.
    const taggers: Tagger[] = [];
    const taggerDir = await fs.opendir(path.join(__dirname, "taggers"));
    for await (const dirent of taggerDir) {
        if (!dirent.isFile() || dirent.name.endsWith(".d.ts")) {
            continue;
        }
        const tagger = (await import(path.join(__dirname, "taggers", dirent.name))).default;

        if (tagger.tag && tagger.onProject) {
            taggers.push(tagger);
            // console.log(`Loaded tagger: ${tagger.tag}`);
        } else {
            console.error(`Invalid tagger: ${tagger.tag} (${dirent.name})`);
        }
    }


    /**
     * Crawls a given directory and runs a callback on each directory.
     *
     * The callback is not run on the directory passed as the path.
     */
    async function crawl(crawlPath: string, mainProject?: Project): Promise<CrawledDirectory> {
        const dir = await fs.opendir(crawlPath);

        const projects: CrawledDirectory = {};

        for await (const dirent of dir) {
            if (!dirent.isDirectory()) {
                continue;
            }

            const crawlDir = new CrawlDirectory(crawlPath, dirent.name);
            // console.log("crawling... ", crawlDir.absolutePath);

            // Check if this directory is a project.
            let detectorResult: Project | false;
            let continueCrawl: boolean = true;
            let highestDetectPriority = Number.NEGATIVE_INFINITY;
            for (const detector of detectors) {
                if (detector.detectPriority < highestDetectPriority) {
                    continue;
                }

                let result;
                try {
                    result = await detector.onDir(crawlDir, mainProject);
                } catch (e) {
                    console.error(`Error in detector ${detector.name}: ${e}`);
                    continue;
                }
                if (typeof result === "object") {
                    detectorResult = Object.assign(result, {
                        detector: detector.name
                    });
                    highestDetectPriority = detector.detectPriority;

                    if (!detector.crawlSubdirectories)
                        continueCrawl = false;
                    if (detector.last)
                        break;
                } else if (result === false) {
                    detectorResult = false;
                    continueCrawl = false;
                    highestDetectPriority = detector.detectPriority;
                }
            }

            if (detectorResult) {
                const projectTags = new Set(detectorResult.tags ?? []);
                taggerLoop: for (const tagger of taggers) {
                    if (projectTags.has(tagger.tag)) {
                        // Skip if already tagged.
                        continue;
                    } else if (Array.isArray(tagger.skipFor)) {
                        for (const skip of tagger.skipFor) {
                            if (typeof skip === "string") {
                                if (detectorResult.detector === skip) {
                                    continue taggerLoop;
                                }
                            } else if (skip.test(detectorResult.detector)) {
                                continue taggerLoop;
                            }
                        }
                    } else if (typeof tagger.skipFor === "string") {
                        if (detectorResult.detector === tagger.skipFor) {
                            continue;
                        }
                    } else if (tagger.skipFor?.test(detectorResult.detector)) {
                        continue;
                    }

                    if (await tagger.onProject(crawlDir, detectorResult)) {
                        projectTags.add(tagger.tag);
                    }
                }

                detectorResult.tags = Array.from(projectTags).sort();
            }

            // Check if we are still going to crawl.
            if (continueCrawl) {
                // Crawl!
                const subprojects = await crawl(
                    path.join(crawlPath, dirent.name),
                    detectorResult || undefined
                );

                // subprojects.length > 0
                const hasSubprojects = Object.entries(subprojects)[0] != null;
                if (typeof detectorResult === "object") {
                    // assigns Project
                    projects[dirent.name] = hasSubprojects ?
                        Object.assign(detectorResult, { subprojects }) :
                        detectorResult;
                } else if (hasSubprojects) {
                    // assigns CrawledDirectory
                    projects[dirent.name] = subprojects;
                }
            } else if (detectorResult !== false) {
                projects[dirent.name] = detectorResult;
            }
        }

        return projects;
    }

    console.log(
        JSON.stringify(
            await crawl(path.resolve(process.cwd(), process.argv[2] ?? ".")),
            null,
            4
        )
    );

})();
