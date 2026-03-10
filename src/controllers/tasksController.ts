import { Request, Response } from 'express';
import {Task, Status, WorkPackage, Project, RWs, Units} from '../models/Index';
import RemainingTasksTable from '../models/tables/RemainingTasksTable';
import {Op} from "sequelize";

export const AVAILABLE_COLUMNS = [
    { id: 'id', label: "ID", getValue: (t: any) => t.id?.toString() || "N/A" },
    { id: 'project', label: "Project", getValue: (t: any) => t.workPackage?.project?.projectName || "N/A" },
    { id: 'wpName', label: "Work Package", getValue: (t: any) => t.workPackage?.wpName || "N/A" },
    { id: 'taskName', label: "Task Name", getValue: (t: any) => t.taskName || "N/A" },
    { id: 'status', label: "Statut", getValue: (t: any) => t.status?.statName || "N/A" },
    { id: 'priority', label: "Priority", getValue: (t: any) => t.Priority?.toString() || "N/A" },
    { id: 'budget', label: "Budget (h)", getValue: (t: any) => t.taskBudgetHours || "Not Found" },
    { id: 'lastRmWork', label: "RW", getValue: (t: any) => {
            if (t.RWs && t.RWs.length > 0) {
                const sortedLogs = t.RWs.sort((a: any, b: any) =>
                    new Date(b.rwDate).getTime() - new Date(a.rwDate).getTime()
                );
                return (sortedLogs[0].rwHours);
            }
            return "Not Found";
        }},
    { id: 'start', label: "Start Date", getValue: (t: any) => t.startDate || "N/A" },
    { id: 'end', label: "End Date", getValue: (t: any) => t.endDate || "N/A" },
    { id: 'created', label: "Created At", getValue: (t: any) => t.CreatedAt ? new Date(t.CreatedAt).toLocaleDateString() : "N/A" },
    { id: 'updated', label: "Last Update", getValue: (t: any) => t.UpdatedAt ? new Date(t.UpdatedAt).toLocaleDateString() : "N/A" },
    { id: 'unit', label: "Unit", getValue: (t: any) => t.unit ? t.unit.unitName : "N/A" },
];

export const generateResteAFaireView = async (userId: number, selectedIds: string[]): Promise<RemainingTasksTable> => {
    const tableData = new RemainingTasksTable();

    const userTasks = await Task.findAll({
        where: {
            AssigneeUserId: userId,
            StatId: 1
        },
        include: [
            { model: Status, as: 'status' },
            { model: WorkPackage, as: 'workPackage'},
            { model: RWs, as: 'RWs' },
            { model: Units, as: 'unit' }
        ]
    });

    const activeColumns = AVAILABLE_COLUMNS.filter(col => selectedIds.includes(col.id));

    tableData.head = activeColumns.map(c => c.label);
    tableData.lines = userTasks.map(task => activeColumns.map(c => c.getValue(task)));

    return tableData;
};

export const createTask = async (req: Request, res: Response) => {
    try {
        const { taskName, budget, unitId, startDate, endDate, wpId, wpSlug, projectSlug, assigneeUser } = req.body;

        const existingTask = await Task.findOne({
            where: {
                wpId : wpId,
                [Op.or]: [
                    { taskName: taskName}
                ]
            }
        });

        if (existingTask) {
            return res.status(400).json({"This task name is already used": false});
        }

        // Création de la tâche

        const newTask = await Task.create({
            taskName: taskName,
            wpId: wpId,
            taskBudgetHours: budget,
            startDate: startDate,
            endDate: endDate,
            assigneeUserId: assigneeUser || null,
            statId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            taskFUPTypeId: 1,
            codeId: 0,
            unitId: unitId
        })

        const slug : String = "/project/" + projectSlug + "/wp/" + wpSlug;
        res.status(200).json({ redirect: slug});

    } catch (error){
        console.error("Erreur lors de la création de la tâche :", error);
        res.status(500).json({ error: "Error while creating the task" });
    };
}