import { Request, Response } from 'express';
import { WorkPackage, Task, Status, Project, Units, RWs, Codes } from "../models/Index";
import { Op } from "sequelize";
import sequelize from "../config/database";

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
    { id: 'rwCurrentHours', label: "RW (h)" }, // Seulement les heures
    { id: 'actions', label: "Actions" }
];

// Dans renderWPDetails, utilisez WP_DETAILS_COLUMNS :
// allColumns: WP_DETAILS_COLUMNS,

export const renderWPDetails = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { projectSlug, wpSlug } = req.params;
    const TABLE_ID = 'wpTasks';
    const selectedColumns = (req as any).tablePreferences[TABLE_ID] || ['taskName', 'status', 'priority'];

    const wp = await WorkPackage.findOne({
        where: { slug: wpSlug },
        include: [{ model: Project, as: 'project' }]
    });

    if (!wp) return res.status(404).render('404',{user});

    res.render('Pages/wpDetails', {
        user, wp, projectSlug: (wp as any).project.slug,
        tableId: TABLE_ID, tableTitle: "Tasks List",
        allColumns: AVAILABLE_COLUMNS, selectedColumns,
        allUnits: await Units.findAll(),
        allStatus: await Status.findAll(),
        createAction: { label: "New Task", icon: "fas fa-plus", modalTarget: "#taskModal" }
    });
};

const isManagerOrAdmin = (user: any) => {
    if (!user || !user.profiles) return false;
    return user.profiles.some((p: any) =>
        ['Administrateur', 'Program Manager'].includes(p.profileName || p.ProfileName || p.name)
    );
};

export const getWPTasksData = async (req: Request, res: Response) => {
    try {
        const wp = await WorkPackage.findOne({ where: { slug: req.params.wpSlug } });
        if (!wp) return res.json({ data: [] });

        const tasks = await Task.findAll({
            where: { wpId: (wp as any).id },
            include: [
                { model: Status, as: 'status' },
                { model: Units, as: 'unit' }
            ]
        });

        res.json({ data: tasks });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};

const generateSlug = (text: string) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

export const createWP = async (req: Request, res: Response) => {
    try {
        const { wpName, startDate, endDate, projectId, projectSlug, fatherWPId } = req.body;
        const currentUser = (req as any).user;

        // VÉRIFICATION DE SÉCURITÉ
        const project = await Project.findByPk(projectId);
        if (!project) return res.status(404).json({ error: "Project not found." });

        if ((project as any).projectTypeId === 1 && !isManagerOrAdmin(currentUser)) {
            return res.status(403).json({ error: "Seuls les Program Managers peuvent créer un WP dans un Corporate Template." });
        }

        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ error: "The end date cannot be earlier than the start date." });
        }

        const generatedSlug = generateSlug(wpName);

        const existingWP = await WorkPackage.findOne({
            where: {
                projectId: projectId,
                [Op.or]: [
                    { wpName: wpName },
                    { slug: generatedSlug }
                ]
            }
        });

        if (existingWP) {
            return res.status(400).json({ error: "This Work Package name (or its generated slug) is already used in this project." });
        }

        await WorkPackage.create({
            wpName: wpName,
            slug: generatedSlug,
            startDate: startDate || null,
            endDate: endDate || null,
            projectId: projectId,
            fatherWPId: fatherWPId ? parseInt(fatherWPId) : null,
            accountNumber: "Default",
            statId: 1
            // wpTypeId a été supprimé !
        });

        const slugProject: String = projectSlug || "";
        res.status(200).json({ redirect: `/project/${slugProject}` });

    } catch (error) {
        console.error("Erreur WP :", error);
        res.status(500).json({ error: "Error while creating the Work Package." });
    }
}

export const updateWP = async (req: Request, res: Response) => {
    try {
        const { id, wpName, accountNumber, fatherWPId, startDate, endDate } = req.body;
        const currentUser = (req as any).user;

        // On inclut le projet pour connaître son type
        const wp = await WorkPackage.findByPk(id, { include: [{ model: Project, as: 'project' }] });
        if (!wp) return res.status(404).json({ error: "Work Package not found." });

        // VÉRIFICATION DE SÉCURITÉ
        if ((wp as any).project.projectTypeId === 1 && !isManagerOrAdmin(currentUser)) {
            return res.status(403).json({ error: "Vous n'avez pas l'autorisation de modifier un Corporate Template." });
        }

        await wp.update({
            wpName,
            accountNumber,
            startDate: startDate || null,
            endDate: endDate || null,
            fatherWPId: fatherWPId ? parseInt(fatherWPId) : null
        });

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Error while updating the Work Package." });
    }
};

export const createWPFromTemplate = async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction();

    try {
        const { sourceWpId, wpName, startDate, endDate, projectId, projectSlug } = req.body;

        const sourceWp = await WorkPackage.findByPk(sourceWpId);
        if (!sourceWp) {
            await transaction.rollback();
            return res.status(404).json({ error: "Template Work Package introuvable." });
        }

        const generatedSlug = generateSlug(wpName);
        const existingWP = await WorkPackage.findOne({
            where: { projectId: projectId, [Op.or]: [{ wpName: wpName }, { slug: generatedSlug }] }
        });

        if (existingWP) {
            await transaction.rollback();
            return res.status(400).json({ error: "Ce nom (ou slug) de Work Package existe déjà dans ce projet." });
        }

        const newWp = await WorkPackage.create({
            wpName: wpName,
            slug: generatedSlug,
            startDate: startDate || null,
            endDate: endDate || null,
            projectId: projectId,
            accountNumber: "Template-" + (sourceWp as any).accountNumber,
            fatherWPId: null,
            statId: 1
            // wpTypeId a été supprimé !
        }, { transaction });

        // On ne crée plus de WPContributor ici car les rôles sont au niveau Projet maintenant !

        const sourceTasks = await Task.findAll({ where: { wpId: sourceWpId } });

        if (sourceTasks.length > 0) {
            const newTasks = sourceTasks.map((task: any) => ({
                wpId: (newWp as any).id,
                taskName: task.taskName,
                taskBudgetHours: task.taskBudgetHours,
                unitId: task.unitId,
                taskFUPTypeId: task.taskFUPTypeId,
                priority: task.priority,
                statId: 1,
                assigneeUserId: null,
                startDate: null,
                endDate: null,
                codeId: null
            }));

            await Task.bulkCreate(newTasks, { transaction });
        }

        await transaction.commit();
        res.status(200).json({ redirect: `/project/${projectSlug}` });

    } catch (error) {
        await transaction.rollback();
        console.error("Erreur Création WP depuis Template :", error);
        res.status(500).json({ error: "Erreur serveur lors de la génération du Work Package." });
    }
};