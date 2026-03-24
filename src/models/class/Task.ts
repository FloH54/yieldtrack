import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";
import { Status } from "./Status";
import { WorkPackage } from "./WorkPackage";
import User from "./User";
import {RWs} from "./RWs";

class Task extends Model {
    declare id: number;              // Mapped to TaskId
    declare wpId: number;
    declare assigneeUserId: number | null;
    declare taskName: string;        // Mapped to TaskName
    declare startDate: Date | null;
    declare endDate: Date | null;
    declare taskBudgetHours: number | null; // Mapped to TaskBudgetMinutes
    declare statId: number;
    declare taskFUPTypeId: number | null;
    declare unitId: number
    declare priority: number | null;

    // Propriétés d'association (peuplées par les 'include')
    declare status?: Status;
    declare workPackage?: WorkPackage;
    declare assignee?: User;
    declare RWs?: RWs[];
}

Task.init(
    {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, field: 'TaskId' },
        wpId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'WPId' },
        assigneeUserId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'AssigneeUserId' },
        taskFUPTypeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'TaskFUPTypeId' },
        taskName: { type: DataTypes.STRING(255), allowNull: false, field: 'TaskName' },
        startDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'TaskStart' },
        endDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'TaskEnd' },
        taskBudgetHours: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'taskBudgetHours' },
        CodeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'CodeId' },
        statId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'StatId' },
        priority: { type: DataTypes.INTEGER, allowNull: true, field: 'Priority' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        unitId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'UnitId' },
    },
    { sequelize, tableName: 'Tasks', timestamps: false }
);

export { Task };