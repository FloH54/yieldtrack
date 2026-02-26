import { Request, Response } from 'express';
import { Task, Status, WorkPackage, Project, RWs } from '../models/Index';
import ResteAFaire from '../models/tables/ResteAFaire';

export const AVAILABLE_COLUMNS = [
    { id: 'id', label: "ID", getValue: (t: any) => t.id?.toString() || "N/A" },
    { id: 'project', label: "Projet", getValue: (t: any) => t.workPackage?.project?.projectName || "N/A" },
    { id: 'wpName', label: "Work Package", getValue: (t: any) => t.workPackage?.wpName || "N/A" },
    { id: 'taskName', label: "Task Name", getValue: (t: any) => t.taskName || "N/A" },
    { id: 'status', label: "Statut", getValue: (t: any) => t.status?.statName || "N/A" },
    { id: 'priority', label: "Priority", getValue: (t: any) => t.Priority?.toString() || "N/A" },
    { id: 'budget', label: "Budget (h)", getValue: (t: any) => t.taskBudgetHours || "Not Found" },
    { id: 'lastRmWork', label: "Last RM Work (h)", getValue: (t: any) => {
            // Utilisation de l'alias correct 'RWs'
            if (t.RWs && t.RWs.length > 0) {
                const sortedLogs = t.RWs.sort((a: any, b: any) =>
                    new Date(b.rwDate).getTime() - new Date(a.rwDate).getTime()
                );
                return (sortedLogs[0].rwHours);
            }
            return "Not Found";
        }},
    { id: 'start', label: "Start Date", getValue: (t: any) => t.taskStart || "N/A" },
    { id: 'end', label: "End Date", getValue: (t: any) => t.taskEnd || "N/A" },
    { id: 'created', label: "Created At", getValue: (t: any) => t.CreatedAt ? new Date(t.CreatedAt).toLocaleDateString() : "N/A" },
    { id: 'updated', label: "Last Update", getValue: (t: any) => t.UpdatedAt ? new Date(t.UpdatedAt).toLocaleDateString() : "N/A" }
];

export const generateResteAFaireView = async (userId: number, selectedIds: string[]): Promise<ResteAFaire> => {
    const tableData = new ResteAFaire();

    const userTasks = await Task.findAll({
        where: {
            AssigneeUserId: userId,
            StatId: 1
        },
        include: [
            { model: Status, as: 'status' },
            { model: WorkPackage, as: 'workPackage'},
            { model: RWs, as: 'RWs' }
        ]
    });

    const activeColumns = AVAILABLE_COLUMNS.filter(col => selectedIds.includes(col.id));

    tableData.head = activeColumns.map(c => c.label);
    tableData.lines = userTasks.map(task => activeColumns.map(c => c.getValue(task)));

    return tableData;
};