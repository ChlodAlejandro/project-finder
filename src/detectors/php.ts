import {Detector, DetectorResult} from "./detector";

export default <Detector>{
    name: "php",
    last: false,
    crawlSubdirectories: true,
    onDir: async(dirInfo, parent): Promise<DetectorResult> => {
        if (parent && parent.detector === "php-web") {
            // Avoid crawling into subdirectories of a DocumentRoot.
            return false;
        }

        const composer = await dirInfo.getFile("composer.json");
        if (composer) {
            const project = (await composer.read()).json();
            return {
                name: project.name ?? dirInfo.name,
                tags: ["php", "composer"]
            };
        }
    }
};
