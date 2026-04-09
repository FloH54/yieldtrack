import { Request, Response } from 'express';
import { Task, RWs, User, WorkPackage, Project, Status, Codes, Units } from "../models/Index";
import { Op } from "sequelize";
import {Roles} from "../config/roles";

// Vérifie si l'utilisateur a le droit d'exporter
const canExport = (user: any) => {
    if (!user || !user.profiles) return false;
    return user.profiles.some((p: any) => {
        const profileId = p.id || p.ProfileId;
        return [Roles.ADMINISTRATOR, Roles.PROGRAM_MANAGER, Roles.KEY_USER].includes(profileId);
    });
};

// Fonction robuste pour formater les dates pour Excel/CSV (JJ/MM/AAAA HH:mm)
const formatDateForCSV = (dateStr: string | Date | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';

    const pad = (n: number) => n.toString().padStart(2, '0');
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};



export const renderExportPage = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!canExport(user)) return res.status(403).render('404', { user, message: "Access denied." });

        res.render('Pages/export', {
            user,
            currentUrl: req.originalUrl
        });
    } catch (err) {
        console.error("Error rendering export page:", err);
        res.status(500).send("Server error");
    }
};

export const exportTasksData = async (req: Request, res: Response) => {
    try {
        if (!canExport((req as any).user)) return res.status(403).json({ error: "Access denied." });

        const fiveWeeksAgo = new Date();
        fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35);

        const tasks = await Task.findAll({
            where: {
                [Op.or]: [
                    { statId: 1 }, // Tâches actives
                    {
                        statId: 4, // Tâches complétées
                        UpdatedAt: { [Op.gte]: fiveWeeksAgo }
                    }
                ]
            },
            include: [
                { model: User, as: 'assignee' },
                { model: WorkPackage, as: 'workPackage', include: [{ model: Project, as: 'project' }] },
                { model: Status, as: 'status' },
                { model: Units, as: 'unit' },
                {
                    model: RWs,
                    as: 'RWs',
                    separate: true,
                    order: [['rwDate', 'DESC']],
                    include: [{ model: Codes, as: 'code' }]
                }
            ]
        });

        const plainTasks = tasks.map(t => t.get({ plain: true }));

        const data = plainTasks.map(t => {
            const latestRW = (t.RWs && t.RWs.length > 0) ? t.RWs[0] : null;

            return {
                "ID": t.id,
                "Analytical Code": t.workPackage?.project?.analyticalCode || "N/A",
                "Task Name": t.taskName,
                "Status": t.status?.statName || t.statId,
                "Priority": t.priority || '',
                "Budget (h)": t.taskBudgetHours || 0,
                "Unit": t.unit?.unitName || 'Unassigned',
                "Start Date": formatDateForCSV(t.startDate),
                "End Date": formatDateForCSV(t.endDate),
                "Created At": formatDateForCSV(t.CreatedAt || t.createdAt),
                "Current RW (Hours)": latestRW ? (latestRW.rwHours || 0) : 0,
                "Code": latestRW?.code?.codeName || 'None',
                "Comment": latestRW?.comment || '',
                "Last Update": formatDateForCSV(t.UpdatedAt || t.updatedAt)
            };
        });

        res.json({ data });
    } catch (err) {
        console.error("Error exporting tasks:", err);
        res.status(500).json({ error: "Server error" });
    }
};

export const exportRWsData = async (req: Request, res: Response) => {
    try {
        if (!canExport((req as any).user)) return res.status(403).json({ error: "Access denied." });

        const fiveWeeksAgo = new Date();
        fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35);

        // 1. Récupérer uniquement les ID des tâches concernées
        const tasks = await Task.findAll({
            where: {
                [Op.or]: [
                    { statId: 1 },
                    {
                        statId: 4,
                        UpdatedAt: { [Op.gte]: fiveWeeksAgo }
                    }
                ]
            },
            attributes: ['id']
        });

        const taskIds = tasks.map(t => (t as any).id);

        if (taskIds.length === 0) return res.json({ data: [] });

        // 2. Récupérer l'historique RW complet rattaché à ces tâches
        const rws = await RWs.findAll({
            where: { taskId: { [Op.in]: taskIds } },
            include: [
                {
                    model: Task,
                    as: 'Task',
                    // --- NEED TO INCLUDE WP AND PROJECT ---
                    include: [{
                        model: WorkPackage,
                        as: 'workPackage',
                        include: [{ model: Project, as: 'project' }]
                    }]
                },
                { model: User, as: 'User' },
                { model: Codes, as: 'code' }
            ],
            order: [['rwDate', 'DESC']]
        });

        const plainRws = rws.map(rw => rw.get({ plain: true }));

        const data = plainRws.map(rw => ({
            "RW ID": rw.rwId,
            "Analytical Code": rw.Task?.workPackage?.project?.analyticalCode || "N/A",
            "Task ID": rw.taskId,
            "Task Name": rw.Task?.taskName || '',
            "User": rw.User ? `${rw.User.firstName} ${rw.User.lastName}` : 'Unknown',
            "Date": formatDateForCSV(rw.rwDate), // Formatage appliqué ici !
            "Remaining Hours": rw.rwHours || 0,
            "Blockage Code": rw.code?.codeName || 'None',
            "Comment": rw.comment || ''
        }));

        res.json({ data });
    } catch (err) {
        console.error("Error exporting RWs:", err);
        res.status(500).json({ error: "Server error" });
    }
};