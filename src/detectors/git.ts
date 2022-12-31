import {Detector, DetectorResult} from "./detector";

export default <Detector>{
    name: "git",
    priority: 100,
    detectPriority: -10,
    last: false,
    crawlSubdirectories: true,
    onDir: async(dirInfo): Promise<DetectorResult> => {
        if (dirInfo.name === ".git") {
            // This is a git directory. Definitely no projects in here. Don't crawl.
            return false;
        }
        const gitDir = await dirInfo.getDirectory(".git");
        if (gitDir) {
            // This is probably a project.
            return {
                name: dirInfo.name,
                tags: [ "git" ]
            };
        }
    }
};
