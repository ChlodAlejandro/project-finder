import {Tagger} from "./tagger";

export default <Tagger>{
    tag: "npm",
    skipFor: "composer",
    onProject: async(dirInfo): Promise<boolean> => {
        if (
            await Promise.all([
                dirInfo.getFile("composer.json"),
                dirInfo.getFile("composer-lock.json")
            ]).then(v => v.some(v => v != null))
        ) {
            // composer package files detected. Likely composer project.
            return true;
        }
    }
};
