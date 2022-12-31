import path, {ParsedPath} from "path";
import fs from "fs/promises";
import type CrawlDirectory from "./CrawlDirectory";

/**
 *
 */
export default class CrawlFile {

    dir: CrawlDirectory;
    path: ParsedPath;
    absolutePath: string;

    /**
     *
     */
    constructor(dir: CrawlDirectory, name: string) {
        this.dir = dir;
        this.absolutePath = path.join(dir.absolutePath, name);
        this.path = path.parse(this.absolutePath);
    }

    /**
     * Reads the file contents.
     */
    async read(): Promise<CrawlFileRead> {
        return new CrawlFileRead(await fs.readFile(this.absolutePath));
    }

}

/**
 *
 */
class CrawlFileRead {

    buffer: Buffer;

    /**
     * The buffer of the file being read.
     * @param buf
     */
    constructor(buf: Buffer) {
        this.buffer = buf;
    }

    /**
     * Returns the file contents as a string.
     *
     * @param encoding The encoding to use. Defaults to `utf8`.
     */
    text(encoding?: BufferEncoding): string {
        return this.buffer.toString(encoding);
    }

    /**
     * Returns a decoded JSON object from the string's contents.
     *
     * @param encoding The original encoding of the JSON file. Defaults to `utf8`.
     */
    json(encoding?: BufferEncoding): Record<string, any> {
        return JSON.parse(this.text(encoding));
    }

}
