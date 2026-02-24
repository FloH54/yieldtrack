import TableInterface from './TableInterface';
import {Model} from "sequelize";
class ResteAFaire {
    name: string;
    head: string[];
    lines: null|string[][];
    more : null|string[];
    moreLines : null|string[][];
    listOptions : null|string[][];

    constructor(userId : number) {
        this.name = "Remaining Work";
        this.head = ["Tack ID","Work Package", "Tack Name", "Status", "Priority", "Start Time", "End Time"];
        this.more = ["Budget","Code","Create at","Update at","Comments"];
        this.lines = []
        this.moreLines = [];
        this.listOptions = [
            ["#editModal","Edit","fas fa-pen fa-fw"],
            ["#archiveModal","Archive It","fas fa-trash fa-fw"]
        ]
    }
}
export default ResteAFaire;