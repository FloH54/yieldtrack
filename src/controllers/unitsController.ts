import { Request, Response } from 'express';
import {Project, Task, Units, WorkPackage} from "../models/Index";


export const UNITS_COLUMNS = [
    { id: 'id', label: "ID" },
    { id: 'name', label: "Unit Name" },
    { id: 'taskName', label: "Task Name" },
    { id: 'project', label: "Project"},
    { id: 'workPackage', label: "Work package" },
    { id: 'user', label: "User" },
    { id: 'budget', label: "Budget" },
    { id: 'startDate', label: "Start Date" },
    { id: 'endDate', label: "End Date" }
]

// Récupération des tâches sans user ayant un Unit que possède un team manager
export const getUnitTasks = async (req: Request, res: Response) => {
    try {
        // Récupération des units du team manager
        const user = (req as any).user;
        const units = Units.findAll({
            where: { UserId: null }
            }
        )
        // Récupération des tâches ayant un Unit sans user
        const tasks = Task.findAll({
            where: { UserId: null,
            units: units},
            include: [
                    { model: WorkPackage, as: 'workPackage', include: [
                        { model: Project, as: 'project' }]
                    }
                ]
        });
        } catch (err){
        console.log("Erreur de chargement des tâches :" + err);
        res.status(500).json({ error: "Error while loading the tasks" });
    }
};

// Rendu des tâches à affilier
export const renderUnitTasksPage = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const TABLE_ID = 'attributionTasks  Table';
        const selectedColumns = (req as any).tablePreferences[TABLE_ID] || ['id', 'name', 'project', 'workPackage', 'user', 'budget'];

        res.render('Pages/attribution', {
            user, tableId: TABLE_ID, tableTitle: "Unit Tasks",
            allColumns: UNITS_COLUMNS, selectedColumns,
            currentUrl: req.originalUrl,
            createAction: null
            });
    } catch (err){
        console.log("Erreur de chargement des tâches :" + err);
        res.status(500).json({ error: "Error while loading the tasks" });
    }
}
