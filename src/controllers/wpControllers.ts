import { Request, Response } from 'express';
import { WorkPackage, Task, Status, Project } from "../models/Index";
import { AVAILABLE_COLUMNS } from "./tasksController"; // Réutilise tes colonnes de tâches
import RemainingTasksTable from "../models/tables/RemainingTasksTable";

export const renderWPDetails = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { wpSlug } = req.params;
    const TABLE_ID = 'wpTasks';
    const selectedIds = (req as any).tablePreferences[TABLE_ID] || ['taskName', 'status', 'priority'];

    const wp = await WorkPackage.findOne({
        where: { slug: wpSlug },
        include: [{ model: Task, as: 'tasks', include: [{ model: Status, as: 'status' }] }]
    });

    if (!wp) return res.status(404).render('404');

    const tableData = new RemainingTasksTable();
    const activeCols = AVAILABLE_COLUMNS.filter(c => selectedIds.includes(c.id));

    tableData.head = activeCols.map(c => c.label);
    tableData.lines = (wp as any).tasks.map((t: any) => activeCols.map(c => c.getValue(t)));

    res.render('Pages/remaining', {
        user, table: tableData, currentTableId: TABLE_ID,
        allColumns: AVAILABLE_COLUMNS, selectedColumns: selectedIds
    });
};

export const createWorkPackage = async (req: Request, res: Response) => {}