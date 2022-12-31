import path, {ParsedPath} from "path";
import fs from "fs/promises";
import { constants } from "fs";
import CrawlFile from "./CrawlFile";

/**
 *
 */
export default class CrawlDirectory {

    name: string;
    path: ParsedPath;
    absolutePath: string;

    /**
     * Creates a new CrawlDirectory.
     *
     * @param rootPath The root path of the crawl.
     * @param name The name of the subdirectory targeted. Leave blank if `rootPath` is targeted.
     */
    constructor(rootPath: string, name?: string) {
        this.name = name;
        this.absolutePath = path.join(rootPath, name);
        this.path = path.parse(this.absolutePath);
    }

    /**
     * Get a file in this directory. Returns `undefined` if the file does not exist.
     */
    async getFile(filename: string): Promise<CrawlFile | undefined> {
        const filePath = path.join(this.absolutePath, filename);
        try {
            await fs.access(filePath, constants.F_OK);
            return new CrawlFile(this, filename);
        } catch (e) {
            return undefined;
        }
    }

    /**
     * Get a subdirectory in this directory. Returns `undefined` if the directory does not exist.
     */
    async getDirectory(dir: string): Promise<CrawlDirectory | undefined> {
        const dirPath = path.join(this.absolutePath, dir);
        try {
            if ((await fs.stat(dirPath)).isDirectory()) {
                return new CrawlDirectory(this.absolutePath, dir);
            }
            return undefined;
        } catch (e) {
            return undefined;
        }
    }

}

