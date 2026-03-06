import { Request, Response } from 'express';
import { WorkPackage, Task, Status, Project } from "../models/Index";
import { AVAILABLE_COLUMNS } from "./tasksController"; // Réutilise tes colonnes de tâches
import RemainingTasksTable from "../models/tables/RemainingTasksTable";
import TaskFromWP from "../models/tables/TaskFromWP";
import {Units} from "../models/class/Units";

export const renderWPDetails = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { wpSlug } = req.params;
    const TABLE_ID = 'wpTasks';
    const selectedIds = (req as any).tablePreferences[TABLE_ID] || ['taskName', 'status', 'priority'];
    const allUnits = await Units.findAll();

    const wp = await WorkPackage.findOne({
        where: { slug: wpSlug },
        include: [
            { model: Task, as: 'tasks', include: [{ model: Status, as: 'status' }] },
            {model: Project, as: 'project'}
        ]
    });




    if (!wp) return res.status(404).render('404');

    const tableData = new TaskFromWP();
    const activeCols = AVAILABLE_COLUMNS.filter(c => selectedIds.includes(c.id));

    tableData.head = activeCols.map(c => c.label);
    tableData.lines = (wp as any).tasks.map((t: any) => activeCols.map(c => c.getValue(t)));

    res.render('Pages/wpDetails', {
        user, table: tableData, currentTableId: TABLE_ID,
        allColumns: AVAILABLE_COLUMNS, selectedColumns: selectedIds,
        projectSlug: (wp as any).project.slug,
        wp: wp,
        allUnits : allUnits
    });
};

export const createWorkPackage = async (req: Request, res: Response) => {

}