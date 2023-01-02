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

            /**
             * Check if the package data has a package.
             */
            function hasPackage(name: string) {
                return nodePackageData.dependencies?.[name] ||
                    nodePackageData.devDependencies?.[name] ||
                    nodePackageData.packages?.[name];
            }

            try {
                // DEVELOPMENT TOOLS
                if (nodePackage || npmPackageLock || npmShrinkwrap) {
                    tags.push("npm");
                }

                if (yarnPackageLock) {
                    tags.push("yarn");
                }

                if (
                    hasPackage("typescript") ||
                    await dirInfo.getFile("tsconfig.json")
                ) {
                    tags.push("typescript");
                }

                if (
                    hasPackage("webpack") ||
                    hasPackage("webpack-cli") ||
                    hasPackage("webpack-dev-server") ||
                    await dirInfo.getFile("webpack.config.js")
                ) {
                    tags.push("webpack");
                }

                if (
                    hasPackage("jshint") ||
                    nodePackageData["jshintConfig "] != null ||
                    await dirInfo.getFile(".jshintrc")
                ) {
                    tags.push("jshint");
                }

                if (
                    hasPackage("eslint") ||
                    nodePackageData["eslintConfig"] != null ||
                    await dirInfo.getFile(".eslintrc.js") ||
                    await dirInfo.getFile(".eslintrc.cjs") ||
                    await dirInfo.getFile(".eslintrc.yaml") ||
                    await dirInfo.getFile(".eslintrc.yml") ||
                    await dirInfo.getFile(".eslintrc.json")
                ) {
                    tags.push("eslint");
                }

                // FRAMEWORKS

                if (await dirInfo.getFile("next.config.js")) {
                    tags.push("next.js");
                }
                if (await dirInfo.getFile("nuxt.config.js")) {
                    tags.push("nuxt.js");
                }
                if (hasPackage("react")) {
                    tags.push("react");
                }
                if (hasPackage("vue")) {
                    tags.push("vue.js");
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
