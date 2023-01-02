import {Tagger} from "./tagger";

export default <Tagger>{
    tag: "git",
    skipFor: "git",
    crawlSubdirectories: true,
    onProject: async(dirInfo): Promise<true> => {
        const gitDir = await dirInfo.getDirectory(".git");
        if (gitDir) {
            // This is probably a git project.
            return true;
        }
    }
};
