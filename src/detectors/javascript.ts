import {Detector, DetectorResult} from "./detector";

export default <Detector>{
    name: "javascript",
    last: false,
    crawlSubdirectories: true,
    onDir: async(dirInfo): Promise<DetectorResult> => {
        if (
            dirInfo.name === "node_modules" ||
            dirInfo.name === ".yarn"
        ) {
            // Package tree. Do not scan.
            return false;
        }

        const tags = [];

        const [
            nodePackage,
            npmPackageLock,
            npmShrinkwrap,
            yarnPackageLock
        ] = await Promise.allSettled([
            dirInfo.getFile("package.json"),
            dirInfo.getFile("package-lock.json"),
            dirInfo.getFile("shrinkwrap.json"),
            dirInfo.getFile("yarn.lock")
        ]).then(v => v.map(p => p.status === "fulfilled" ? p.value : undefined));

        if (nodePackage || npmPackageLock || npmShrinkwrap || yarnPackageLock) {
            const nodePackageData = await (
                nodePackage || npmPackageLock || npmShrinkwrap
            )?.read().then(d => d.json());

            try {
                if (
                    nodePackage || npmPackageLock || npmShrinkwrap
                ) {
                    tags.push("npm");
                }

                if (await dirInfo.getFile("tsconfig.json")) {
                    tags.push("typescript");
                }

                if (
                    nodePackageData["jshintConfig "] != null ||
                    await dirInfo.getFile(".jshintrc")
                ) {
                    tags.push("jshint");
                }

                if (
                    nodePackageData["eslintConfig"] != null ||
                    await dirInfo.getFile(".eslintrc.js") ||
                    await dirInfo.getFile(".eslintrc.cjs") ||
                    await dirInfo.getFile(".eslintrc.yaml") ||
                    await dirInfo.getFile(".eslintrc.yml") ||
                    await dirInfo.getFile(".eslintrc.json")
                ) {
                    tags.push("eslint");
                }
            } catch (e) {
                // Silent failure.
            }

            return {
                name: dirInfo.name,
                tags: [ "javascript", ...tags ]
            };
        }
    }
};
