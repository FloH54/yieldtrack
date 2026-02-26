import { Task } from "../models/class/Task";

export interface ColumnDefinition {
    id: string;
    label: string;
    dbField?: string;
    getValue: (task: Task) => string;
}

export const AVAILABLE_TASK_COLUMNS: Record<string, ColumnDefinition> = {
    id: {
        id: 'id',
        label: 'ID Tâche',
        getValue: (t) => t.id ? t.id.toString() : "N/A"
    },
    name: {
        id: 'name',
        label: 'Nom de la tâche',
        getValue: (t) => t.taskName || "N/A"
    },
    status: {
        id: 'status',
        label: 'Statut',
        // Utilise l'association définie dans le modèle
        getValue: (t) => t.status ? t.status.statName : (t.statId ? t.statId.toString() : "N/A")
    },
    assignee: {
        id: 'assignee',
        label: 'Responsable',
        // Utilise l'association assignee
        getValue: (t) => t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : 'Non assigné'
    },
    project: {
        id: 'project',
        label: 'Projet',
        // Task -> WorkPackage -> Project (nécessite les includes corrects dans le controller)
        getValue: (t) => (t as any).workPackage?.project?.projectName || 'N/A'
    },
    budget: {
        id: 'budget',
        label: 'Budget (h)',
        // Correction: taskBudgetHeure n'existe pas, c'est taskBudgetMinutes en base
        getValue: (t) => t.taskBudgetHours ? (t.taskBudgetHours / 60).toFixed(2) + ' h' : '-'
    }
};