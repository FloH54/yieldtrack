import { Request, Response } from 'express';
import { Project, Status, User } from "../models/Index";

export const DIRECTOR_PROJECT_COLUMNS = [
    { id: 'id', label: "ID" },
    { id: 'projectName', label: "Project Name" },
    { id: 'creator', label: "Manager" },
    { id: 'startDate', label: "Start Date" },
    { id: 'endDate', label: "End Date" },
    { id: 'status', label: "Status" }
];

export const renderDirectorProjects = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const TABLE_ID = 'directorProjectsTable';
    const selectedColumns = (req as any).tablePreferences[TABLE_ID] || ['id', 'projectName', 'creator', 'status'];

    res.render('Pages/director-projects', {
        user, tableId: TABLE_ID, tableTitle: "All Projects (Director View)",
        allColumns: DIRECTOR_PROJECT_COLUMNS, selectedColumns,
        currentUrl: req.originalUrl,
        createAction: null // Le directeur ne crée pas forcément d'ici
    });
};

export const getAllProjectsData = async (req: Request, res: Response) => {
    try {
        // Le directeur voit TOUS les projets, sans filtre sur creatorUserId
        const allProjects = await Project.findAll({
            include: [
                { model: Status, as: 'status' },
                { model: User, as: 'creator', attributes: ['firstName', 'lastName'] }
            ]
        });
        res.json({ data: allProjects });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};

export const toggleProjectStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const project = await Project.findByPk(id);
        if (!project) return res.status(404).json({ error: "Project not found" });

        // Si le projet est actif (1), on le clôture (4 = completed). Sinon on le rouvre (1).
        // (Vérifiez que les IDs correspondent à votre table Status dans data.sql)
        const newStatus = project.statId === 1 ? 4 : 1;

        await project.update({ statId: newStatus });
        res.status(200).json({ success: true, newStatus });
    } catch (error) {
        res.status(500).json({ error: "Error updating project status" });
    }
};