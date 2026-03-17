import { Request, Response } from 'express';
import { Project, WorkPackage, Units } from "../models/Index";
import {WPTypes} from "../models/class/WPTypes";

export const PROJECT_COLUMNS = [
    { id: 'id', label: "ID" },
    { id: 'name', label: "Project Name" },
    { id: 'slug', label: "Slug" },
    { id: 'start', label: "Start Date" },
    { id: 'end', label: "End Date" }
];

export const WP_COLUMNS = [
    { id: 'id', label: "ID" },
    { id: 'name', label: "WP Name" },
    { id: 'type', label: "Type" }, // Ajouté
    { id: 'parent', label: "Parent WP" }, // Ajouté
    { id: 'account', label: "Account Number" },
    { id: 'slug', label: "Slug" }
];

export const renderProjectsPage = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const TABLE_ID = 'projectList';
    const selectedColumns = (req as any).tablePreferences[TABLE_ID] || ['name', 'start', 'end'];

    // CORRECTION : On doit rendre la vue "projects" et non "remaining"
    res.render('Pages/projects', {
        user, tableId: TABLE_ID, tableTitle: "Projects List",
        allColumns: PROJECT_COLUMNS, selectedColumns,
        currentUrl: req.originalUrl,
        createAction: { label: "New Project", icon: "fas fa-plus", modalTarget: "#projectModal" }
    });
};

export const getProjectsData = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const userProjects = await Project.findAll({ where: { creatorUserId: user.id } });
        res.json({ data: userProjects });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};

export const renderProjectDetails = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { slug } = req.params;
    const TABLE_ID = 'wpList';
    const selectedColumns = (req as any).tablePreferences[TABLE_ID] || ['name', 'type', 'account'];

    const project = await Project.findOne({ where: { slug } });
    if (!project) return res.status(404).render('404');

    // On récupère les données pour les listes déroulantes de la modale d'édition
    const allWPTypes = await WPTypes.findAll();
    const projectWPs = await WorkPackage.findAll({ where: { projectId: project.id } });

    res.render('Pages/projectsDetails', {
        user, project, tableId: TABLE_ID, tableTitle: "Work Packages",
        allColumns: WP_COLUMNS, selectedColumns,
        units: await Units.findAll(),
        allWPTypes, projectWPs, // Envoyés à la vue
        currentUrl: req.originalUrl,
        createAction: { label: "New Work Package", icon: "fas fa-plus", modalTarget: "#customWPModal" }
    });
};

export const getProjectWPsData = async (req: Request, res: Response) => {
    try {
        const project = await Project.findOne({
            where: { slug: req.params.slug },
            include: [{
                model: WorkPackage,
                as: 'workPackages',
                include: [
                    { model: WPTypes, as: 'type' },    // Inclure le nom du type
                    { model: WorkPackage, as: 'father' } // Inclure le parent
                ]
            }]
        });
        res.json({ data: (project as any)?.workPackages || [] });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};

export const createProject = async (req: Request, res: Response) => {
    try {
        const { projectName, slug, startDate, endDate } = req.body;
        const creatorUserId = (req as any).user.id;

        if (new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ error: "The end date is invalid" });
        }

        const newProject = await Project.create({
            projectName, slug, startDate, endDate, creatorUserId
        });
        res.status(200).json({ redirect: '/project' });
    } catch (error) {
        res.status(500).json({ error: "Error while creating project" });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        const { id, projectName, slug, startDate, endDate } = req.body;

        // Validation basique des dates
        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ error: "The end date is invalid" });
        }

        const project = await Project.findByPk(id);
        if (!project) return res.status(404).json({ error: "Project not found" });

        // Mise à jour
        await project.update({
            projectName,
            slug,
            startDate: startDate || null,
            endDate: endDate || null
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ error: "Error while updating project" });
    }
};