import {Tagger} from "./tagger";

export default <Tagger>{
    tag: "github",
    crawlSubdirectories: true,
    onProject: async(dirInfo): Promise<true> => {
        const ghDir = await dirInfo.getDirectory(".github");
        if (ghDir) {
            return true;
        }

        // Try checking if a GitHub remote exists
        const gitDir = await dirInfo.getDirectory(".git");
        if (gitDir) {
            const config = await gitDir.getFile("config")
                .then(f => f?.read().then(d => d.text()));
            if (config?.includes("github.com")) {
                return true;
            }
        }
    }
};
