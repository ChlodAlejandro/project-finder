import {Tagger} from "./tagger";

export default <Tagger>{
    tag: "docker",
    onProject: async(dirInfo): Promise<boolean> => {
        if (await dirInfo.getFile("Dockerfile")) {
            // Dockerfile detected. Likely Docker project.
            return true;
        }
    }
};
