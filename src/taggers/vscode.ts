import {Tagger} from "./tagger";

export default <Tagger>{
    tag: "vscode",
    onProject: async(dirInfo): Promise<boolean> => {
        if (await dirInfo.getDirectory(".vscode")) {
            // .vscode metadata folder detected. Likely Visual Studio Code project.
            return true;
        }
    }
};
