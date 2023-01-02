import {Tagger} from "./tagger";

export default <Tagger>{
    tag: "apache",
    onProject: async(dirInfo): Promise<boolean> => {
        if (await dirInfo.getFile(".htaccess")) {
            // .htaccess files found in root directory. Very likely Apache project.
            return true;
        }
    }
};
