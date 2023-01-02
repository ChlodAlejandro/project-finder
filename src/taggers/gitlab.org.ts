import {Tagger} from "./tagger";

export default <Tagger>{
    tag: "gitlab.org",
    crawlSubdirectories: true,
    onProject: async(dirInfo): Promise<true> => {
        // Try checking if a GitLab.org remote exists
        const gitDir = await dirInfo.getDirectory(".git");
        if (gitDir) {
            const config = await gitDir.getFile("config")
                .then(f => f?.read().then(d => d.text()));
            if (config?.includes("gitlab.org") || config?.includes("gitlab.com")) {
                return true;
            }
        }
    }
};
