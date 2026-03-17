import { Request, Response } from 'express';
import { WorkPackage, Task, Status, Project, Units } from "../models/Index";
import { AVAILABLE_COLUMNS } from "./tasksController";
import {Op} from "sequelize";

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
    try {
        // On récupère projectId et fatherWPId depuis le corps de la requête
        const { wpName, slug, startDate, endDate, projectId,projectSlug, fatherWPId } = req.body;

        // Validation des dates
        if (new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ error: "La date de fin est invalide." });
        }

        // Vérifier si le Nom ou le Slug existe déjà dans CE projet
        const existingWP = await WorkPackage.findOne({
            where: {
                projectId: projectId,
                [Op.or]: [
                    { wpName: wpName },
                    { slug: slug }
                ]
            }
        });

        if (existingWP) {
            return res.status(400).json({ error: "Ce nom ou ce slug existe déjà pour ce projet." });
        }

        // Création du Work Package
        const newWP = await WorkPackage.create({
            wpName: wpName,
            slug: slug,
            startDate: startDate,
            endDate: endDate,
            projectId: projectId,
            fatherWPId: fatherWPId || null,
            accountNumber: "Default",
            wpTypeId: 1
        });

        const slugProject : String = projectSlug || "";
        res.status(200).json({ redirect: `/project/` + slugProject});

    } catch (error) {
        console.error("Erreur lors de la création du WP :", error);
        res.status(500).json({ error: "Erreur lors de la création du Work Package" });
    }
}


export const updateWP = async (req: Request, res: Response) => {
    try {
        const { id, wpName, slug, accountNumber, wpTypeId, fatherWPId } = req.body;

        const wp = await WorkPackage.findByPk(id);
        if (!wp) return res.status(404).json({ error: "Work Package not found" });

        await wp.update({
            wpName,
            slug,
            accountNumber,
            wpTypeId: parseInt(wpTypeId),
            fatherWPId: fatherWPId ? parseInt(fatherWPId) : null
        });

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Error while updating Work Package" });
    }
};