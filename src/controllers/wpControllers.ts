import { Request, Response } from 'express';
import { WorkPackage, Task, Status, Project } from "../models/Index";
import { AVAILABLE_COLUMNS } from "./tasksController"; // Réutilise tes colonnes de tâches
import RemainingTasksTable from "../models/tables/RemainingTasksTable";
import TaskFromWP from "../models/tables/TaskFromWP";
import {Units} from "../models/class/Units";
import {Op} from "sequelize";
import {DefaultDeserializer} from "node:v8";

export const renderWPDetails = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { wpSlug } = req.params;
    const TABLE_ID = 'wpTasks';
    const selectedIds = (req as any).tablePreferences[TABLE_ID] || ['taskName', 'status', 'priority'];
    const allUnits = await Units.findAll();

    const wp = await WorkPackage.findOne({
        where: { slug: wpSlug },
        include: [
            { model: Task, as: 'tasks', include: [{ model: Status, as: 'status' }, {model: Units, as : 'unit' }] },
            { model: Project, as: 'project' },
        ]
    });

    if (!wp) return res.status(404).render('404');

    const tableData = new TaskFromWP();
    const activeCols = AVAILABLE_COLUMNS.filter(c => selectedIds.includes(c.id));

    tableData.head = activeCols.map(c => c.label);
    tableData.lines = (wp as any).tasks.map((t: any) => activeCols.map(c => c.getValue(t)));

    res.render('Pages/wpDetails', {
        user, table: tableData, currentTableId: TABLE_ID,
        allColumns: AVAILABLE_COLUMNS, selectedColumns: selectedIds,
        projectSlug: (wp as any).project.slug,
        wp: wp,
        allUnits : allUnits
    });
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