import {Tagger} from "./tagger";

export default <Tagger>{
    tag: "npm",
    skipFor: "javascript",
    onProject: async(dirInfo): Promise<boolean> => {
        if (
            await Promise.all([
                dirInfo.getFile("package.json"),
                dirInfo.getFile("package-lock.json"),
                dirInfo.getFile("shrinkwrap.json")
            ]).then(v => v.some(v => v != null))
        ) {
            // npm package files detected. Likely npm project.
            return true;
        }
    }
};
