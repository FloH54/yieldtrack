import { Request, Response } from 'express';
import { Task, Status, WorkPackage, Project, RWs, Units } from '../models/Index';
import { Op } from "sequelize";

export const AVAILABLE_COLUMNS = [
    { id: 'id', label: "ID" },
    { id: 'project', label: "Project" },
    { id: 'wpName', label: "Work Package" },
    { id: 'taskName', label: "Task Name" },
    { id: 'status', label: "Statut" },
    { id: 'priority', label: "Priority" },
    { id: 'budget', label: "Budget (h)" },
    { id: 'unit', label: "Unit" }
];

// Rendu de la page HTML

export const renderRemainingPage = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const TABLE_ID = 'remainingTasks';
        const selectedColumns = (req as any).tablePreferences[TABLE_ID] || ['id', 'project', 'taskName', 'status'];

        // On récupère les unités car la modale task.ejs en a besoin pour son menu déroulant
        const allUnits = await Units.findAll();

        res.render('Pages/remaining', {
            user,
            tableId: TABLE_ID,
            tableTitle: "Remaining Tasks",
            allColumns: AVAILABLE_COLUMNS,
            selectedColumns,
            currentUrl: req.originalUrl,
            // On définit ces variables à null car on n'est pas dans le contexte d'un WP précis
            wp: null,
            projectSlug: null,
            allUnits,
            createAction: null // Désactivé ici car on ne sait pas à quel WP lier la tâche
        });
    } catch (error) {
        res.status(500).send("Erreur lors du rendu de la page");
    }
};

// ... (Gardez getRemainingTasksData, createTask, archiveTask) ...

// Nouvelle route API JSON
export const getRemainingTasksData = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const userTasks = await Task.findAll({
            where: { AssigneeUserId: userId, StatId: 1 },
            include: [
                { model: Status, as: 'status' },
                { model: WorkPackage, as: 'workPackage', include: [{ model: Project, as: 'project' }] },
                { model: RWs, as: 'RWs' },
                { model: Units, as: 'unit' }
            ]
        });
        res.json({ data: userTasks });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};

export const createTask = async (req: Request, res: Response) => {
    // ... [Votre code existant pour createTask] ...
    try {
        const { taskName, budget, unitId, startDate, endDate, wpId, wpSlug, projectSlug, assigneeUser } = req.body;
        const existingTask = await Task.findOne({
            where: { wpId : wpId, [Op.or]: [{ taskName: taskName}] }
        });
        if (existingTask) { return res.status(400).json({"error": "This task name is already used"}); }

        const newTask = await Task.create({
            taskName: taskName, wpId: wpId, taskBudgetHours: budget, startDate: startDate,
            endDate: endDate, assigneeUserId: assigneeUser || null, statId: 1, createdAt: new Date(),
            updatedAt: new Date(), taskFUPTypeId: 1, codeId: 0, unitId: unitId
        });
        const slug : String = "/project/" + projectSlug + "/wp/" + wpSlug;
        res.status(200).json({ redirect: slug});
    } catch (error){
        console.error("Erreur création tâche:", error);
        res.status(500).json({ error: "Error while creating the task" });
    }
}

// Fonction d'archivage
export const archiveTask = async (req: Request, res: Response) => {
    try {
        const { id , redirectUrl } = req.body;
        await Task.update({ statId : 2 }, { where: { id: id } });
        res.redirect(redirectUrl || '/remaining');
    } catch (err) {
        res.status(500).json({ error: "Error while archiving the task" });
    }
}

// Rendu des tâches ayant un Unit sans user
export const renderUnitTasks = async (req: Request, res: Response) => {
    try {
        const  unitId = req.params.unitId;
        const tasks = await Units.findAll({
            where: { UnitId: unitId,
                UserId: null },
            include: [ { model: Task },
                {model: WorkPackage, as: 'workPackage'}]
        })
    } catch (err){
        console.log("Erreur de chargement des tâches :" + err);
        res.status(500).json({ error: "Error while loading the tasks" });
    }
};