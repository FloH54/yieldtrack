import { Request, Response } from 'express';
import {Task, Status, WorkPackage, Project, RWs, Units, Codes} from '../models/Index';
import { Op } from "sequelize";

export const AVAILABLE_COLUMNS = [
    { id: 'id', label: "ID" },
    { id: 'project', label: "Project" },
    { id: 'wpName', label: "Work Package" },
    { id: 'taskName', label: "Task Name" },
    { id: 'status', label: "Status" },
    { id: 'priority', label: "Priority" },
    { id: 'budget', label: "Budget (h)" },
    { id: 'unit', label: "Unit" },
    { id: 'startDate', label: "Start Date" },
    { id: 'endDate', label: "End Date" },
    { id: 'createdAt', label: "Created At" },

    // --- COLONNES RW-1 ---
    { id: 'rw1Hours', label: "RW-1 (Hours)" },

    // --- COLONNES CURRENT RW ---
    { id: 'rwCurrentHours', label: "Current RW (Hours)" },
    { id: 'rwCurrentCode', label: "Current RW (Cost Code)" },
    { id: 'rwCurrentComment', label: "Current RW (Comment)" },

    { id: 'addrw', label: "Action" }
];

// Rendu de la page HTML

export const renderRemainingPage = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const TABLE_ID = 'remainingTasks';

        // Sélection par défaut (On met les heures et les actions par défaut pour ne pas trop surcharger l'écran initialement)
        const selectedColumns = (req as any).tablePreferences[TABLE_ID] || [
            'project', 'taskName', 'rw1Hours', 'rw1Date', 'rwCurrentHours', 'rwCurrentDate', 'addrw'
        ];

        const allUnits = await Units.findAll();
        const allCodes = await Codes.findAll();

        res.render('Pages/remaining', {
            user,
            tableId: TABLE_ID,
            tableTitle: "Remaining Work",
            allColumns: AVAILABLE_COLUMNS,
            selectedColumns,
            currentUrl: req.originalUrl,
            wp: null,
            projectSlug: null,
            allUnits,
            allCodes,
            createAction: null
        });
    } catch (error) {
        res.status(500).send("Error while rendering the page");
    }
};


export const getRemainingTasksData = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const userTasks = await Task.findAll({
            where: { assigneeUserId: userId, statId: 1 },
            include: [
                { model: Status, as: 'status' },
                {
                    model: WorkPackage,
                    as: 'workPackage',
                    where: { statId: 1 },
                    include: [{
                        model: Project,
                        as: 'project',
                        where: { statId: 1 }
                    }]
                },
                { model: Units, as: 'unit' },
                // --- MODIFICATION ICI : On inclut les Codes avec les RWs ---
                {
                    model: RWs,
                    as: 'RWs',
                    include: [{ model: Codes, as: 'code' }]
                }
            ]
        });
        res.json({ data: userTasks });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};

export const createTask = async (req: Request, res: Response) => {
    try {
        // On ne récupère plus taskFUPTypeId depuis req.body
        const { wpId, assigneeUserId, taskName, unitId, taskStart, taskEnd, taskBudgetHours, codeId, priority } = req.body;

        const safeInt = (val: any) => {
            if (!val) return null;
            const parsed = parseInt(val, 10);
            return isNaN(parsed) ? null : parsed;
        };

        const parsedWpId = safeInt(wpId);

        if (!parsedWpId) return res.status(400).json({ error: "L'ID du Work Package est manquant." });

        const newTask = await Task.create({
            wpId: parsedWpId,
            assigneeUserId: safeInt(assigneeUserId),
            taskFUPTypeId: 2, // 2 = 'Heures restant à faire' (Forcé par défaut)
            taskName: taskName,
            unitId: safeInt(unitId),
            taskStart: taskStart || null,
            taskEnd: taskEnd || null,
            taskBudgetHours: safeInt(taskBudgetHours),
            codeId: safeInt(codeId),
            priority: safeInt(priority),
            statId: 1 // 1 = Actif par défaut
        });

        // En renvoyant simplement "success: true", le frontend saura qu'il doit recharger la page courante
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Erreur création tâche:", error);
        res.status(500).json({ error: "Erreur lors de la création de la tâche." });
    }
};

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

export const updateTask = async (req: Request, res: Response) => {
    try {
        const { taskId, userId } = req.body;
        const task = await Task.findByPk(taskId);
        if (!task) return res.status(404).json({ error: "Task not found" });

        // Mise à jour de la tâche (si userId est vide, on met null)
        await task.update({ assigneeUserId: userId || null });

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Error updating assignee" });
    }
};

export const bulkSubmitRW = async (req: Request, res: Response) => {
    try {
        const { updates } = req.body;
        const userId = (req as any).user.id;

        // new Date() capture la date ET l'heure à la seconde près
        const now = new Date();

        if (!updates || updates.length === 0) {
            return res.status(400).json({ error: "Aucune donnée à sauvegarder" });
        }

        for (const update of updates) {
            const { taskId, rwHours, codeId, comment } = update;

            // On CRÉE toujours une nouvelle entrée dans l'historique
            await RWs.create({
                taskId: taskId,
                userId: userId,
                rwDate: now, // Date et heure d'enregistrement
                rwHours: parseInt(rwHours),
                codeId: codeId ? parseInt(codeId) : null,
                comment: comment || null
            });

            // Si le RW est de 0, on clôture la tâche (StatId = 4)
            if (parseInt(rwHours) === 0) {
                await Task.update({ statId: 4 }, { where: { id: taskId } });
            }
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Erreur Bulk RW:", error);
        res.status(500).json({ error: "Erreur lors de la sauvegarde du Remaining Work" });
    }
};

export const getTaskRWHistory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const history = await RWs.findAll({
            where: { taskId: id },
            include: [{ model: Codes, as: 'code' }], // Inclut le libellé du code caisse
            order: [
                ['rwDate', 'DESC'],
                ['rwId', 'DESC'] // Tri secondaire au cas où plusieurs saisies le même jour
            ]
        });
        res.json({ data: history });
    } catch (error) {
        console.error("Erreur lors du chargement de l'historique :", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération de l'historique" });
    }
};