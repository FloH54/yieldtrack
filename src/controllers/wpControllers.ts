import { Request, Response } from 'express';
import {WorkPackage, Task, Status, Project, Units, RWs, Codes, WPContributor} from "../models/Index";
import { AVAILABLE_COLUMNS } from "./tasksController";
import {Op} from "sequelize";
import sequelize from "../config/database";

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
    try {
        // 1. Trouver le WP correspondant
        const wp = await WorkPackage.findOne({ where: { slug: req.params.wpSlug } });
        if (!wp) return res.json({ data: [] });

        // 2. Trouver strictement les tâches de CE wpId
        const tasks = await Task.findAll({
            where: { wpId: (wp as any).id }, // Le filtre strict est ici
            include: [
                { model: Status, as: 'status' },
                { model: Units, as: 'unit' }
                // Ajoutez l'include RWs ici si vous l'aviez mis en place précédemment
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

        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ error: "The end date cannot be earlier than the start date." });
        }

        const generatedSlug = generateSlug(wpName);

        // Vérifier si le Nom ou le Slug généré existe déjà dans CE projet
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
            fatherWPId: fatherWPId || null,
            accountNumber: "Default",
            wpTypeId: 1
        });

        const slugProject: String = projectSlug || "";
        res.status(200).json({ redirect: `/project/` + slugProject });

    } catch (error) {
        console.error("Erreur WP :", error);
        res.status(500).json({ error: "Error while creating the Work Package." });
    }
}

export const updateWP = async (req: Request, res: Response) => {
    try {
        const { id, wpName, accountNumber, wpTypeId, fatherWPId, startDate, endDate } = req.body;

        const wp = await WorkPackage.findByPk(id);
        if (!wp) return res.status(404).json({ error: "Work Package not found." });

        await wp.update({
            wpName,
            accountNumber,
            startDate: startDate || null,
            endDate: endDate || null,
            wpTypeId: parseInt(wpTypeId),
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
        const currentUser = (req as any).user;

        // 1. Récupérer le WP source
        const sourceWp = await WorkPackage.findByPk(sourceWpId);
        if (!sourceWp) {
            await transaction.rollback();
            return res.status(404).json({ error: "Template Work Package introuvable." });
        }

        // 2. Générer le slug et vérifier les conflits
        const generatedSlug = generateSlug(wpName);
        const existingWP = await WorkPackage.findOne({
            where: { projectId: projectId, [Op.or]: [{ wpName: wpName }, { slug: generatedSlug }] }
        });

        if (existingWP) {
            await transaction.rollback();
            return res.status(400).json({ error: "Ce nom (ou slug) de Work Package existe déjà dans ce projet." });
        }

        // 3. Créer le nouveau Work Package
        const newWp = await WorkPackage.create({
            wpName: wpName,
            slug: generatedSlug,
            startDate: startDate || null,
            endDate: endDate || null,
            projectId: projectId,
            accountNumber: "Template-" + sourceWp.accountNumber, // Par défaut
            wpTypeId: sourceWp.wpTypeId, // Hérite du type source
            fatherWPId: null,
            statId: 1
        }, { transaction });

        // Ajouter le créateur comme contributeur par défaut sur le nouveau WP
        await WPContributor.create({
            wpId: newWp.id,
            userId: currentUser.id,
            profileId: 3 // ID du profil Program Manager/Leader
        }, { transaction });

        // 4. Récupérer et dupliquer les tâches
        const sourceTasks = await Task.findAll({ where: { wpId: sourceWpId } });

        if (sourceTasks.length > 0) {
            const newTasks = sourceTasks.map(task => ({
                wpId: newWp.id,
                taskName: task.taskName,
                taskBudgetHours: task.taskBudgetHours,
                unitId: task.unitId,
                taskFUPTypeId: task.taskFUPTypeId,
                Priority: task.priority,
                // --- ON RÉINITIALISE CES VALEURS ---
                statId: 1, // Remis à Actif
                assigneeUserId: null, // Personne n'est assigné
                startDate: null, // Reset des dates
                endDate: null,
                CodeId: null
            }));

            // BulkCreate insère toutes les tâches d'un coup
            await Task.bulkCreate(newTasks, { transaction });
        }

        // 5. Tout s'est bien passé, on valide la transaction
        await transaction.commit();
        res.status(200).json({ redirect: `/project/${projectSlug}` });

    } catch (error) {
        // En cas d'erreur, on annule tout ce qui a été fait
        await transaction.rollback();
        console.error("Erreur Création WP depuis Template :", error);
        res.status(500).json({ error: "Erreur serveur lors de la génération du Work Package." });
    }
};