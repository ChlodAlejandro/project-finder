import {Tagger} from "./tagger";

export default <Tagger>{
    tag: "gitlab",
    crawlSubdirectories: true,
    onProject: async(dirInfo): Promise<true> => {
        const glDir = await dirInfo.getDirectory(".gitlab");
        if (glDir) {
            return true;
        }
    }
};
