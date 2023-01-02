import type CrawlDirectory from "../crawl/CrawlDirectory";
import {Project} from "../Project";

interface Detector {
    /**
     * The name of this detector. Make it unique.
     */
    name: string;
    /**
     * The priority of this detector. The higher the number, the
     * earlier it will be run.
     *
     * @default 0
     */
    priority: number;
    /**
     * The detection priority of this detector. This is the same as the run
     * priority (`priority`) by default. The higher the priority, the more
     * this detector will run over past detectors.
     *
     * @default 0
     */
    detectPriority?: number;
    /**
     * Whether the finder should stop processing detectors if this detector
     * returns a Project object.
     *
     * @default true
     */
    last?: boolean;
    /**
     * Whether to also crawl subdirectories of this project for more
     * projects. This helps find subprojects, monorepos, etc.
     *
     * @default true
     */
    crawlSubdirectories?: boolean;
    /**
     * Run on every crawled directory.
     *
     * @param dirInfo The directory being crawled.
     */
    onDir: (dirInfo: CrawlDirectory, parentProject?: Project) =>
        DetectorResult | Promise<DetectorResult>;

}

/**
 * The result of a detector.
 *
 * A Project if the directory contains a project. `false` if the directory
 * does not contain a project and should not be crawled further, or `void` if
 * the directory does not contain a project but should be crawled further.
 */
type DetectorResult = Omit<Project, "subprojects" | "detector"> | false | void;
