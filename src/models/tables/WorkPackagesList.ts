import TableInterface from './TableInterface';

class WorkPackagesList implements TableInterface { // C'est mieux d'implémenter l'interface
    name: string;
    head: string[];
    lines: string[][]; // Retiré le null pour simplifier, initialisé vide
    more: string[] | null;
    moreLines: string[][] | null;
    createAction = {
        label: "New Work Package",
        icon: "fas fa-plus",
        modalTarget: "#createWPModal",
    };
    rowActions = [
        { label: "Edit", icon: "fas fa-pen fa-fw", modalTarget: "#editModal" },
        { label: "Archive It", icon: "fas fa-trash fa-fw", modalTarget: "#archiveModal" }
    ];

    constructor(userId: number) {
        this.name = "Work Package List";
        this.head = [ "Name", "Account Number" ,"Start at", "End at"];
        this.more = ["Creator", "Last Update", "Create at", "Poject Name"];

        this.lines = [] as string[][];
        this.moreLines = [] as string[][];
    }
}
export default WorkPackagesList;