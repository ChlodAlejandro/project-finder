export interface Project {
    name: string;
    detector: string;
    tags: string[];
    subprojects?: Project[];
}
