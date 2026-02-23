import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Task extends Model {
    // Déclaration des types pour TypeScript
    public id!: number;
    public wpId!: number;
    public assigneeUserId!: number;
    public taskFUPTypeId!: number;
    public taskName!: string;
    public taskStart!: Date | null;
    public taskEnd!: Date | null;
    public taskBudgetMinutes!: number | null;
    public codeId!: number | null;
    public status!: string;
    public priority!: number | null;
    public createdAt!: Date;
    public updatedAt!: Date;

    /**
     * Convertit la tâche en un tableau de strings correspondant
     * aux colonnes head + more de la classe ResteAFaire.
     */
    /**
     * Sépare les données de la tâche en deux tableaux distincts
     * pour correspondre aux attributs 'lines' et 'moreLines' de ResteAFaire.
     */
    public getTableData(): { mainLine: string[], extraLine: string[] } {
        // 1. Les informations principales (Correspond à this.head)
        const mainLine = [
            this.id.toString(),
            this.wpId.toString(), // À remplacer par le nom via jointure plus tard
            this.taskName,
            this.status,
            this.priority !== null ? this.priority.toString() : "",
            this.taskStart ? this.taskStart.toString() : "",
            this.taskEnd ? this.taskEnd.toString() : ""
        ];

        // 2. Les informations supplémentaires (Correspond à this.more)
        const extraLine = [
            this.taskBudgetMinutes !== null ? this.taskBudgetMinutes.toString() : "",
            this.codeId !== null ? this.codeId.toString() : "", // Idem, jointure
            this.createdAt ? this.createdAt.toISOString().split('T')[0] : "",
            this.updatedAt ? this.updatedAt.toISOString().split('T')[0] : "",
            "" // Ligne réservée aux commentaires
        ];

        return { mainLine, extraLine };
    }
}

Task.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            field: 'TaskId'
        },
        wpId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'WPId'
        },
        assigneeUserId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'AssigneeUserId'
        },
        taskFUPTypeId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'TaskFUPTypeId'
        },
        taskName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'TaskName'
        },
        taskStart: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: 'TaskStart'
        },
        taskEnd: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: 'TaskEnd'
        },
        taskBudgetMinutes: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            field: 'TaskBudgetMinutes'
        },
        codeId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            field: 'CodeId'
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'Status'
        },
        priority: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'Priority'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'CreatedAt'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'UpdatedAt'
        }
    },
    {
        sequelize,
        tableName: 'Tasks',
        timestamps: false,
    }
);

export { Task };