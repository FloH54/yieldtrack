import TableInterface, {TableLine} from './TableInterface';

class ProjectsList implements TableInterface { // C'est mieux d'implémenter l'interface
    name: string;
    head: string[];
    lines: TableLine[] | null; // Retiré le null pour simplifier, initialisé vide
    more: string[] | null;
    moreLines: string[][] | null;
    createAction = {
        label: "New Project",
        icon: "fas fa-plus",
        modalTarget: "#projectModal",
    };
    rowActions = [
        { label: "Edit", icon: "fas fa-pen fa-fw", modalTarget: "#editModal" },
        { label: "Archive It", icon: "fas fa-trash fa-fw", modalTarget: "#archiveModal" }
    ];

    constructor(userId: number) {
        this.name = "Projects List";
        this.head = [ "Project Name", "Start at", "End at"];
        this.more = [ "Last Update", "Create at"];

        this.lines = [];
        this.moreLines = [] as string[][];
    }
}
export default ProjectsList;