import { Request, Response } from 'express';
import { Project, Task, Units, User, WorkPackage } from "../models/Index";
import { UserToUnits } from "../models/class/UserToUnits";
import { Op } from "sequelize";

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
];

// Fonction utilitaire pour vérifier si l'utilisateur est Admin
const isAdmin = (user: any) => {
    if (!user.profiles) return false;
    return user.profiles.some((profile: any) => {
        const roleName = profile.profileName || profile.ProfileName || profile.name;
        return roleName === 'Administrateur';
    });
};

// Récupération des tâches sans user
export const getUnitTasks = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        // Clause de base : Tâche non assignée et active
        let whereClause: any = {
            assigneeUserId: null,
            statId: 1
        };

        // Si l'utilisateur n'est PAS Administrateur, on filtre par ses Unités (Team Manager)
        if (!isAdmin(user)) {
            const userAssignments = await UserToUnits.findAll({
                where: { UserId: user.id }
            });

            // Si le manager n'a aucune unité, il ne verra aucune tâche
            if (userAssignments.length === 0) {
                return res.json({ data: [] });
            }

            const unitIds = userAssignments.map(ua => ua.unitId || (ua as any).UnitId);
            whereClause.unitId = { [Op.in]: unitIds };
        }

        // Récupération des tâches selon la clause définie
        const tasks = await Task.findAll({
            where: whereClause,
            include: [
                {
                    model: WorkPackage,
                    as: 'workPackage',
                    where: { statId: 1 }, // WP actif
                    include: [{
                        model: Project,
                        as: 'project',
                        where: { statId: 1 } // Projet actif
                    }]
                },
                { model: Units, as: 'unit' }
            ]
        });

        res.json({ data: tasks });
    } catch (err) {
        console.error("Erreur de chargement des tâches :", err);
        res.status(500).json({ error: "Error while loading the tasks" });
    }
};

// Rendu de la page d'allocation
export const renderUnitTasksPage = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const TABLE_ID = 'allocationTasksTable';
        const selectedColumns = (req as any).tablePreferences[TABLE_ID] || ['id', 'project', 'workPackage', 'taskName', 'unit', 'budget','user'];

        const usersData = await User.findAll({
            where: { IsActive: true },
            include: [Units]
        });

        // NOUVEAU : Récupération de toutes les unités
        const allUnitsData = await Units.findAll();

        const allUsers = usersData.map(u => u.get({ plain: true }));
        const allUnits = allUnitsData.map(u => u.get({ plain: true }));

        res.render('Pages/allocation', {
            user,
            allUsers,
            allUnits, // Ajouté ici
            tableId: TABLE_ID,
            tableTitle: "Unit Tasks Allocation",
            allColumns: UNITS_COLUMNS,
            selectedColumns,
            currentUrl: req.originalUrl,
            createAction: null
        });
    } catch (err) {
        console.error("Erreur de rendu de la page allocation :", err);
        res.status(500).json({ error: "Error while loading the page" });
    }
}

// Mise à jour de l'assignation
export const updateAsigneeUser = async (req: Request, res: Response) => {
    try {
        const { taskId, userId } = req.body;
        const user = (req as any).user;

        // 1. On cherche la tâche pour vérifier son UnitId
        const task = await Task.findByPk(taskId);
        if (!task) return res.status(404).json({ error: "Task not found" });

        // 2. Sécurité : Vérifier si l'utilisateur a le droit de modifier cette tâche spécifique
        if (!isAdmin(user)) {
            const userAssignments = await UserToUnits.findAll({
                where: { UserId: user.id }
            });
            const unitIds = userAssignments.map(ua => ua.unitId || (ua as any).UnitId);

            // Si l'UnitId de la tâche n'est pas dans les unités du manager, on bloque
            if (!unitIds.includes((task as any).unitId)) {
                return res.status(403).json({ error: "Unauthorized to modify this task" });
            }
        }

        // 3. Application de la modification
        const newAssigneeId = (userId === '') ? null : userId;
        await task.update({ assigneeUserId: newAssigneeId });

        res.sendStatus(200);
    } catch (err) {
        console.error("Erreur lors du changement de user :", err);
        res.status(500).json({ error: "Error while associating the task" });
    }
}

export const createUnit = async (req: Request, res: Response) => {
    try {
        const { unitName, fatherUnitId } = req.body;
        const user = (req as any).user;

        if (!isAdmin(user)) {
            return res.status(403).json({ error: "Seul un Administrateur peut créer une unité." });
        }

        await Units.create({
            unitName,
            fatherUnitId: fatherUnitId ? parseInt(fatherUnitId) : null
        });

        res.status(200).json({ success: true, redirect: '/allocation' }); // Ou vers une page dédiée aux unités
    } catch (error) {
        console.error("Erreur création unité :", error);
        res.status(500).json({ error: "Erreur lors de la création de l'unité." });
    }
};

export const assignUserToUnit = async (req: Request, res: Response) => {
    try {
        const { userId, unitId, weeklyHours } = req.body;
        const user = (req as any).user;

        // Vérification si le Team Manager gère bien cette unité (optionnel mais recommandé)
        if (!isAdmin(user)) {
            const managerUnits = await UserToUnits.findAll({ where: { userId: user.id } });
            const managerUnitIds = managerUnits.map(mu => mu.unitId || (mu as any).UnitId);
            if (!managerUnitIds.includes(parseInt(unitId))) {
                return res.status(403).json({ error: "Vous ne gérez pas cette unité." });
            }
        }

        // Vérifie si l'affectation existe déjà
        const existing = await UserToUnits.findOne({ where: { userId, unitId } });
        if (existing) {
            return res.status(400).json({ error: "L'utilisateur est déjà dans cette unité." });
        }

        const today = new Date().toISOString().split('T')[0];

        await UserToUnits.create({
            userId,
            unitId,
            weeklyHours: weeklyHours || 35, // ou 0 par défaut
            startDate: today
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de l'affectation à l'unité." });
    }
};

