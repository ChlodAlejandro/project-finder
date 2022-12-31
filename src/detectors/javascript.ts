import {Detector, DetectorResult} from "./detector";

export default <Detector>{
    name: "javascript",
    last: false,
    crawlSubdirectories: true,
    onDir: async(dirInfo): Promise<DetectorResult> => {
        if (dirInfo.name === "node_modules") {
            // Package tree. Do not scan.
            return false;
        }

        try {
            const packageJson = await (
                await dirInfo.getFile("package.json") ??
                await dirInfo.getFile("package-lock.json") ??
                await dirInfo.getFile("shrinkwrap.json")
            )?.read().then(d => d.json());
            if (packageJson) {
                return {
                    name: dirInfo.name,
                    tags: [ "javascript" ]
                };
            }
        } catch (e) {
            // Silent failure.
        }
    }
};
