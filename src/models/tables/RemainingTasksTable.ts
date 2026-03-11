import TableInterface, {TableLine} from './TableInterface';

class RemainingTasksTable implements TableInterface {
    name: string;
    plusAction: boolean;
    plusMapAction: Map<string, any>;
    head: string[];
    lines: TableLine[] | null;
    more: null | string[];
    moreLines: null;

    rowActions = [
        { label: "Edit", icon: "fas fa-pen fa-fw", modalTarget: "#editModal" },
        { label: "Archive It", icon: "fas fa-trash fa-fw", modalTarget: "#archiveTaskModal" }
    ];

    constructor() {
        this.name = "Remaining Tasks";
        this.plusAction = true;
        this.plusMapAction = new Map<string, any>();
        this.plusMapAction.set("name", "New Task");
        this.head = [];
        this.lines = [];
        this.more = null;
        this.moreLines = null;
    }
}

export default RemainingTasksTable;