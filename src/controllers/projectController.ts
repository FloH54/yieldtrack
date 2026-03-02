import { Request, Response } from 'express';
import ProjectsList from '../models/tables/ProjectsList';
import { Project, WorkPackage, WPContributor } from "../models/Index"
import {Units} from "../models/class/Units";
import {Op} from "sequelize";

// Générer l'objet RemainingTasksTable complet pour un ID donné.
export const generateProjectListsForOwner = async (userId: number): Promise<ProjectsList> => {
    const tableProjectsList = new ProjectsList(userId);

    const userProjects = await Project.findAll({
        include: [{
            model: WorkPackage,
            as: 'workPackages',
            required: false,
            include: [{
                model: WPContributor,
                as: 'contributors',
                where: {userId: userId}, // ...où cet utilisateur précis est contributeur
                required: false
            }]
        }],
        group: ['Project.ProjectId']
    });

    // On map pour l'affichage
    tableProjectsList.lines = userProjects.map((p: any) => {
        return [
            `<a href="/project/${p.slug}" class="font-weight-bold text-primary">${p.projectName}</a>`, // Nom du projet est cliquable vers le slug du projet.
            p.startDate ? new Date(p.startDate).toLocaleDateString() : '-',
            p.endDate ? new Date(p.endDate).toLocaleDateString() : '-'
        ]
    });

    return tableProjectsList;

};

// Récupérer l'ID, appeler la fonction, envoyer à la vue.
export const renderProjectsPage = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const tableData = await generateProjectListsForOwner(user.id);
        const allUnits = await Units.findAll();
        console.log(allUnits);
        res.render('Pages/remaining', {
            user: user,
            table: tableData,
            units: allUnits,
            currentTableId: 'projectList',
            allColumns: [],
            selectedColumns: []
        });

    } catch (error) {
        console.error("Erreur lors de la génération des Projets :", error);
        res.status(500).send("Erreur serveur");
    }
};

export const createProject = async (req: Request, res: Response) => {
    try {
        // Extraction des données du formulaire
        const { projectName, slug, startDate, endDate } = req.body;
        const creatorUserId = (req as any).user.id; // creatorId <- userId

        // Vérifie si les dates sont dans l'ordre
        if (new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ error: "The end date is invalid" });
        }

        // Vérifier si le Nom ou le Slug existe déjà
        const existingProject = await Project.findOne({
            where: {
                [Op.or]: [
                    { projectName: projectName },
                ]
            }
        });
        const existingSlug = await Project.findOne({
            where: {
                [Op.or]: [
                    { projectName: projectName },
                    { slug: slug }
                ]
            }
        });

        if (existingProject) {
            return res.status(400).json({ error:"This project name already exists"});
        }

        if (existingSlug) {
            return res.status(400).json({ error:"This slug name already exists"});
        }

        const newProject = await Project.create({
            projectName: projectName,
            slug: slug,
            startDate: startDate,
            endDate: endDate,
            creatorUserId: creatorUserId
        });

        // Redirection vers la liste des projets après succès
        res.redirect('/project/' + newProject.slug);

    } catch (error) {
        console.error("Erreur lors de la création du projet :", error);
        res.status(500).json({ error:"Error while creating projet"});
    }
};