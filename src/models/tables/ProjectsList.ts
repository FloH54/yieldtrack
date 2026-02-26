import TableInterface from './TableInterface';

class ProjectsList implements TableInterface { // C'est mieux d'implémenter l'interface
    name: string;
    head: string[];
    lines: string[][]; // Retiré le null pour simplifier, initialisé vide
    more: string[] | null;
    moreLines: string[][] | null;
    listOptions: string[][] | null;
    plusAction: boolean = false; // Manquait par rapport à l'interface

    constructor(userId: number) {
        this.name = "Remaining Work";
        this.head = ["Project ID", "Project Name", "Start at", "End at"];
        this.more = ["Creator", "Last Update", "Create at"];

        // Correction ici : typage explicite pour éviter 'never[]'
        this.lines = [] as string[][];
        this.moreLines = [] as string[][];

        this.listOptions = [
            ["#editModal", "Edit", "fas fa-pen fa-fw"],
            ["#archiveModal", "Archive It", "fas fa-trash fa-fw"]
        ];
    }
}
export default ProjectsList;