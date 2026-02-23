import { Request, Response } from 'express';
import { Task } from '../models/Task';
import ResteAFaire from '../models/tables/ResteAFaire';

// Générer l'objet ResteAFaire complet pour un ID donné.
export const generateResteAFaireView = async (userId: number): Promise<ResteAFaire> => {
    const tableResteAFaire = new ResteAFaire(userId);

    const userTasks = await Task.findAll({
        where: { assigneeUserId: userId }
    });

    const tempLines: string[][] = [];
    const tempMoreLines: string[][] = [];

    userTasks.forEach((task) => {
        const { mainLine, extraLine } = task.getTableData();
        tempLines.push(mainLine);
        tempMoreLines.push(extraLine);
    });

    tableResteAFaire.lines = tempLines;
    tableResteAFaire.moreLines = tempMoreLines;

    return tableResteAFaire;
};

// Récupérer l'ID, appeler la fonction, envoyer à la vue.
export const renderTasksPage = async (req: Request, res: Response) => {
    try {
        // A. On récupère l'ID de l'utilisateur
        const userId = (req as any).user.id;

        // B. ON UTILISE LA FONCTION ICI ! (C'est ce qui manquait)
        // On récupère notre objet tout prêt en une seule ligne
        const dataPourLaVue = await generateResteAFaireView(userId);

        // C. On transfère cet objet à la vue EJS
        res.render('tasks', {
            user: (req as any).user,
            resteAFaireData: dataPourLaVue // On passe l'objet généré
        });

    } catch (error) {
        console.error("Erreur lors de la génération des tâches :", error);
        res.status(500).send("Erreur serveur");
    }
};