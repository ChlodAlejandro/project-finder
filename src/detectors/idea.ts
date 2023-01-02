import {Detector, DetectorResult} from "./detector";

export default <Detector>{
    name: "idea",
    priority: 0,
    detectPriority: -10,
    last: false,
    crawlSubdirectories: false,
    onDir: async(dirInfo): Promise<DetectorResult> => {
        if (dirInfo.name === ".idea") {
            // This is the IDEA metadata folder! No projects here!
            return false;
        }

        if (await dirInfo.getDirectory(".idea")) {
            // This is a JetBrains IDEA project.
            return {
                name: dirInfo.name,
                tags: [ "jetbrains-idea" ]
            };
        }
    }
};
