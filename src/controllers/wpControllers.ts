import { Request, Response } from 'express';
import { WorkPackage, Task, Status, Project, Units } from "../models/Index";
import { AVAILABLE_COLUMNS } from "./tasksController";

export const renderWPDetails = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { projectSlug, wpSlug } = req.params; // Adaptez selon votre route
    const TABLE_ID = 'wpTasks';
    const selectedColumns = (req as any).tablePreferences[TABLE_ID] || ['taskName', 'status', 'priority'];

    const wp = await WorkPackage.findOne({
        where: { slug: wpSlug },
        include: [{ model: Project, as: 'project' }]
    });

    if (!wp) return res.status(404).render('404');

    res.render('Pages/wpDetails', {
        user, wp, projectSlug: (wp as any).project.slug,
        tableId: TABLE_ID, tableTitle: "Tasks List",
        allColumns: AVAILABLE_COLUMNS, selectedColumns, allUnits: await Units.findAll(),
        createAction: { label: "New Task", icon: "fas fa-plus", modalTarget: "#taskModal" }
    });
};

export const getWPTasksData = async (req: Request, res: Response) => {
    const wp = await WorkPackage.findOne({
        where: { slug: req.params.wpSlug },
        include: [{ model: Task, as: 'tasks', include: [{ model: Status, as: 'status' }, { model: Units, as: 'unit' }] }]
    });
    res.json({ data: (wp as any)?.tasks || [] });
};

export const createWP = async (req: Request, res: Response) => {
    // ... [Votre code existant] ...
}