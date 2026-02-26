import TableInterface from './TableInterface';

class ResteAFaire implements TableInterface {
    name: string;
    plusAction: boolean;
    head: string[];
    lines: string[][];
    more: string[] | null;
    moreLines: string[][] | null;
    listOptions: string[][] | null;

    constructor() {
        this.name = "Remaining Tasks";
        this.plusAction = false;
        this.head = [];
        this.lines = []; // Initialisé vide, sera rempli par le controller
        this.more = null;
        this.moreLines = null;
        this.listOptions = [
            ["#editTaskModal", "Edit", "fas fa-pen fa-fw"]
        ];
    }
}

// Correction cruciale : export par défaut direct de la classe, pas d'un objet
export default ResteAFaire;