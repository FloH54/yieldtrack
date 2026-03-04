import TableInterface from './TableInterface';

class TaskFromWP implements TableInterface {
    name: string;
    plusAction: boolean;
    plusMapAction: Map<string, any>;
    head: string[];
    lines: string[][];
    more: null | string[];
    moreLines: null;

    createAction = {
        label: "New Task",
        icon: "fas fa-plus",
        modalTarget: "#taskModal",
    };

    rowActions = [
        { label: "Edit", icon: "fas fa-pen fa-fw", modalTarget: "#editModal" },
        { label: "Archive It", icon: "fas fa-trash fa-fw", modalTarget: "#archiveModal" }
    ];

    constructor() {
        this.name = "Tasks List";
        this.plusAction = true;
        this.plusMapAction = new Map<string, any>();
        this.plusMapAction.set("name", "New Task");
        this.head = [];
        this.lines = [];
        this.more = null;
        this.moreLines = null;
    }
}

export default TaskFromWP;