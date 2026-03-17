import { Request, Response } from 'express';
import {Project, Task, Units, User, WorkPackage} from "../models/Index";
import {UserToUnits} from "../models/class/UserToUnits";
import {Op} from "sequelize";


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
        const userAssignments = await UserToUnits.findAll({
            where: { UserId: user.id  }
        });

        const unitIds = userAssignments.map(ua => ua.unitId|| (ua as any).UnitId)

        // Récupération des tâches ayant un Unit sans user
        const tasks = await Task.findAll({
            where: {
                assigneeUserId: null,
                unitId: { [Op.in]: unitIds }},
            include: [
                    { model: WorkPackage, as: 'workPackage',
                        include: [{ model: Project, as: 'project' }]
                    },
                { model: Units, as: 'unit' }
                ]
        });

            res.json({ data: tasks });
        } catch (err){
        console.log("Erreur de chargement des tâches :" + err);
        res.status(500).json({ error: "Error while loading the tasks" });
    }
};

// Rendu des tâches à affilier
export const renderUnitTasksPage = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const TABLE_ID = 'allocationTasksTable';
        const selectedColumns = (req as any).tablePreferences[TABLE_ID] || ['id', 'name', 'project', 'workPackage', 'user', 'budget'];

        const usersData = await User.findAll({
            where: { IsActive: true},
            include: [Units]
        });

        const allUsers = usersData.map(u => u.get({ plain: true }));

        res.render('Pages/allocation', {
            user,
            allUsers,
            tableId: TABLE_ID, tableTitle: "Unit Tasks",
            allColumns: UNITS_COLUMNS, selectedColumns,
            currentUrl: req.originalUrl,
            createAction: null
            });
    } catch (err){
        console.log("Erreur de chargement des tâches :" + err);
        res.status(500).json({ error: "Error while loading the tasks" });
    }
}

export const updateAsigneeUser = async (req: Request, res: Response) => {
    try {
        const { taskId, userId } = req.body;
        if(userId == ''){
            await Task.update({ assigneeUserId: null }, { where: { id: taskId } });
            res.sendStatus(200);
        } else {
            await Task.update({assigneeUserId: userId}, {where: {id: taskId}});
            res.sendStatus(200);
        }
        } catch (err){
        console.log("Erreur lors de changement de user :" + err);
        res.status(500).json({ error: "Error while associate the task" });
    }
}
