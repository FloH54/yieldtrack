import { Request, Response } from 'express';
import ProjectsList from '../models/tables/ProjectsList';
import {Project, WorkPackage, WPContributor} from "../models/Index";
import {generateResteAFaireView} from "./tasksController";

// Générer l'objet ResteAFaire complet pour un ID donné.
export const generateProjectListsForOwner = async (userId: number): Promise<ProjectsList> => {
    const tableProjectsList = new ProjectsList(userId);

    const userProjects = await Project.findAll({
        include: [{
            model: WorkPackage,
            as: 'workPackages',
            required: true, // Ne garde que les projets qui ont des WorkPackages...
            include: [{
                model: WPContributor,
                as: 'contributors',
                where: { userId: userId }, // ...où cet utilisateur précis est contributeur
                required: true
            }]
        }]
    });

    const tempLines: string[][] = [];
    const tempMoreLines: string[][] = [];

// userProjects est déjà un tableau de projets dédoublonnés !
    userProjects.forEach((project: any) => {
        const { mainLine, extraLine } = project.getTableData();
        tempLines.push(mainLine);
        tempMoreLines.push(extraLine);
    });


    return tableProjectsList;
};

// Récupérer l'ID, appeler la fonction, envoyer à la vue.
export const renderTasksPage = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        // CORRECTION ICI : Ajout d'un tableau de colonnes par défaut en 2e argument
        const defaultColumns = ['id', 'wpName', 'taskName', 'budget'];
        const dataPourLaVue = await generateResteAFaireView(userId, defaultColumns);

        res.render('tasks', {
            user: (req as any).user,
            resteAFaireData: dataPourLaVue
        });

    } catch (error) {
        console.error("Erreur lors de la génération des tâches :", error);
        res.status(500).send("Erreur serveur");
    }
};