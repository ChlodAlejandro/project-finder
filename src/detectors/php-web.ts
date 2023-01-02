import {Detector, DetectorResult} from "./detector";

export default <Detector>{
    name: "php-web",
    last: false,
    crawlSubdirectories: true,
    onDir: async(dirInfo, parent): Promise<DetectorResult> => {
        if (parent && parent.detector === "php-web") {
            // Avoid crawling into subdirectories of a DocumentRoot.
            return false;
        }

        if (await dirInfo.getFile("index.php")) {
            return {
                name: dirInfo.name,
                tags: ["php"]
            };
        }
    }
};
