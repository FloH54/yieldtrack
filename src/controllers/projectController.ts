import { Request, Response } from 'express';
import ProjectsList from '../models/tables/ProjectsList';
import { Project, WorkPackage, WPContributor } from "../models/Index"
import {Units} from "../models/class/Units";
import {Op} from "sequelize";
import WorkPackagesList from "../models/tables/WorkPackagesList";

export const PROJECT_COLUMNS = [
    { id: 'id', label: "ID", getValue: (p: any) => p.id?.toString() || "N/A" },
    { id: 'name', label: "Project Name", getValue: (p: any) => p.projectName || "N/A" },
    { id: 'slug', label: "Slug", getValue: (p: any) => p.slug || "N/A" },
    { id: 'start', label: "Start Date", getValue: (p: any) => p.startDate || "-" },
    { id: 'end', label: "End Date", getValue: (p: any) => p.endDate || "-" }
];

export const WP_COLUMNS = [
    { id: 'id', label: "ID", getValue: (wp: any) => wp.id?.toString() || "N/A" },
    { id: 'name', label: "WP Name", getValue: (wp: any) => wp.wpName || "N/A" },
    { id: 'account', label: "Account Number", getValue: (wp: any) => wp.accountNumber || "N/A" },
    { id: 'slug', label: "Slug", getValue: (wp: any) => wp.slug || "N/A" }
];

// Liste tous les projets d'un utilisateur
export const renderProjectsPage = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const TABLE_ID = 'projectList';
    const selectedIds = (req as any).tablePreferences[TABLE_ID] || ['name', 'start', 'end'];

    const userProjects = await Project.findAll({ where: { creatorUserId: user.id } });
    const tableData = new ProjectsList(user.id);

    const activeCols = PROJECT_COLUMNS.filter(c => selectedIds.includes(c.id));
    tableData.head = activeCols.map(c => c.label);
    tableData.lines = userProjects.map(p => {
        const row = activeCols.map(c => c.getValue(p));
        // On remplace le nom par un lien cliquable
        const nameIdx = activeCols.findIndex(c => c.id === 'name');
        if (nameIdx !== -1) row[nameIdx] = `<a href="/project/${p.slug}">${p.projectName}</a>`;
        return row;
    });

    res.render('Pages/remaining', { // Vue générique avec table
        user, table: tableData, currentTableId: TABLE_ID,
        allColumns: PROJECT_COLUMNS, selectedColumns: selectedIds
    });
};
// Détails d'un projets (liste des work packages)
export const renderProjectDetails = async (req: Request, res: Response) => {
        const user = (req as any).user;
        const { slug } = req.params;
        const TABLE_ID = 'wpList';
        const selectedIds = (req as any).tablePreferences[TABLE_ID] || ['name', 'account'];

        const project = await Project.findOne({
            where: { slug },
            include: [{ model: WorkPackage, as: 'workPackages' }]
        });

        if (!project) return res.status(404).render('404');

        const tableData = new WorkPackagesList(user.id);
        const activeCols = WP_COLUMNS.filter(c => selectedIds.includes(c.id));

        tableData.head = activeCols.map(c => c.label);
        tableData.lines = (project as any).workPackages.map((wp: any) => {
            const row = activeCols.map(c => c.getValue(wp));
            const nameIdx = activeCols.findIndex(c => c.id === 'name');
            if (nameIdx !== -1) row[nameIdx] = `<a href="/project/${slug}/wp/${wp.slug}">${wp.wpName}</a>`;
            return row;
        });

        const units = await Units.findAll();
        res.render('Pages/projectsDetails', {
            user, project, table: tableData, units, currentTableId: TABLE_ID,
            allColumns: WP_COLUMNS, selectedColumns: selectedIds
        });
};

export const createProject = async (req: Request, res: Response) => {
    try {
        // Extraction des données du formulaire
        const {projectName, slug, startDate, endDate} = req.body;
        const creatorUserId = (req as any).user.id; // creatorId <- userId

        // Vérifie si les dates sont dans l'ordre
        if (new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({error: "The end date is invalid"});
        }

        // Vérifier si le Nom ou le Slug existe déjà
        const existingProject = await Project.findOne({
            where: {
                [Op.or]: [
                    {projectName: projectName},
                ]
            }
        });
        const existingSlug = await Project.findOne({
            where: {
                [Op.or]: [
                    {projectName: projectName},
                    {slug: slug}
                ]
            }
        });

        if (existingProject) {
            return res.status(400).json({error: "This project name already exists"});
        }

        if (existingSlug) {
            return res.status(400).json({error: "This project slug name already exists"});
        }

        const newProject = await Project.create({
            projectName: projectName,
            slug: slug,
            startDate: startDate,
            endDate: endDate,
            creatorUserId: creatorUserId
        });

        // Redirection vers la liste des projets après succès
        res.status(200).json({redirect: '/project'});

    } catch (error) {
        console.error("Erreur lors de la création du projet :", error);
        res.status(500).json({error: "Error while creating projet"});
    }
};