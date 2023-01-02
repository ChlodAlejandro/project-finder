import {Tagger} from "./tagger";

export default <Tagger>{
    tag: "jetbrains-idea",
    onProject: async(dirInfo): Promise<boolean> => {
        if (await dirInfo.getDirectory(".idea")) {
            // .idea metadata folder detected. Likely JetBrains IDEA project.
            return true;
        }
    }
};
