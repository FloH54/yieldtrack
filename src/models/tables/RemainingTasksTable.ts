import TableInterface from './TableInterface';

class RemainingTasksTable implements TableInterface {
    name: string;
    plusAction: boolean;
    plusMapAction: Map<string, any>;
    head: string[];
    lines: string[][];
    more: null | string[];
    moreLines: null;

    rowActions = [
        { label: "Edit", icon: "fas fa-pen fa-fw", modalTarget: "#editModal" },
        { label: "Archive It", icon: "fas fa-trash fa-fw", modalTarget: "#archiveModal" }
    ];

    constructor() {
        this.name = "Remaining Tasks";
        this.plusAction = true;
        this.plusMapAction = new Map<string, any>();
        this.plusMapAction.set("name", "New Task");
        this.head = [];
        this.lines = []; // Initialisé vide, sera rempli par le controller
        this.more = null;
        this.moreLines = null;
    }
}

// Correction cruciale : export par défaut direct de la classe, pas d'un objet
export default RemainingTasksTable;