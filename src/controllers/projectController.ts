import { Request, Response } from 'express';
import { Project, WorkPackage, Units } from "../models/Index";

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
    const selectedColumns = (req as any).tablePreferences[TABLE_ID] || ['name', 'account'];

    const project = await Project.findOne({ where: { slug } });
    if (!project) return res.status(404).render('404');

    res.render('Pages/projectsDetails', {
        user, project, tableId: TABLE_ID, tableTitle: "Work Packages",
        allColumns: WP_COLUMNS, selectedColumns, units: await Units.findAll(),
        currentUrl: req.originalUrl,
        createAction: { label: "New Work Package", icon: "fas fa-plus", modalTarget: "#customWPModal" } // Modifié pour pointer vers la bonne modale
    });
};

export const getProjectWPsData = async (req: Request, res: Response) => {
    try {
        const project = await Project.findOne({
            where: { slug: req.params.slug },
            include: [{ model: WorkPackage, as: 'workPackages' }]
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