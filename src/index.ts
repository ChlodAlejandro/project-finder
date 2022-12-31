import fs from "fs/promises";
import CrawlDirectory from "./crawl/CrawlDirectory";
import path from "path";
import {Detector} from "./detectors/detector";
import type {Project} from "./project";

interface CrawledDirectory {
    [ key: string ]: Project | CrawledDirectory;
}

(async() => {

    // Load all detectors.
    const detectors: Detector[] = [];
    const dir = await fs.opendir(path.join(__dirname, "detectors"));
    for await (const dirent of dir) {
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
            console.log(`Loaded detector: ${detector.name}`);
        } else {
            console.error(`Invalid detector: ${detector.name} (${dirent.name})`);
        }
    }
    detectors.sort(
        (a, b) =>
            (b.priority ?? 0) - (a.priority ?? 0) || a.name.localeCompare(b.name)
    );


    /**
     * Crawls a given directory and runs a callback on each directory.
     *
     * The callback is not run on the directory passed as the path.
     */
    async function crawl(crawlPath: string): Promise<CrawledDirectory> {
        const dir = await fs.opendir(crawlPath);

        const projects: CrawledDirectory = {};

        for await (const dirent of dir) {
            if (!dirent.isDirectory()) {
                continue;
            }

            const crawlDir = new CrawlDirectory(crawlPath, dirent.name);
            console.log("crawling... ", crawlDir.absolutePath);

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
                    result = await detector.onDir(crawlDir);
                } catch (e) {
                    console.error(`Error in detector ${detector.name}: ${e}`);
                    continue;
                }
                if (typeof result === "object") {
                    detectorResult = Object.assign(result, {
                        detector: detector.name
                    });
                    highestDetectPriority = detector.detectPriority;

                    if (detector.last)
                        break;
                    if (!detector.crawlSubdirectories)
                        continueCrawl = false;
                } else if (result === false) {
                    detectorResult = false;
                    continueCrawl = false;
                    highestDetectPriority = detector.detectPriority;
                }
            }

            // Check if we are still going to crawl.
            if (continueCrawl) {
                // Crawl!
                const subprojects = await crawl(path.join(crawlPath, dirent.name));

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
            await crawl(path.resolve(process.cwd())),
            null,
            4
        )
    );

})();
