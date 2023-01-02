import type CrawlDirectory from "../crawl/CrawlDirectory";
import {Project} from "../Project";

interface Tagger {
    /**
     * The tag applied by this tagger. Make it unique.
     */
    tag: string;
    /**
     * This tagger gets skipped if the detector of a project matches one of the
     * strings or regular expressions in this array.
     */
    skipFor?: string | RegExp | (string | RegExp)[];
    /**
     * Run on every found project. If `true` is returned, the tag provided in `tag` will be
     * appended to the list of tags.
     *
     * @param dirInfo The directory being crawled.
     */
    onProject: (dirInfo: CrawlDirectory, project: Project) =>
        boolean | void | Promise<boolean | void>;

}
