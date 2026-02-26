import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database';

class TaskComments extends Model {
    public commentId!: number;
    public taskId!: number;
    public userId!: number;
    public content!: string;
    public createdAt!: Date;
}

TaskComments.init({
    commentId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, field: 'CommentId' },
    taskId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'TaskId' },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'UserId' },
    content: { type: DataTypes.TEXT, allowNull: false, field: 'Content' },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'CreatedAt' }
}, { sequelize, tableName: 'TaskComments', timestamps: false });

export { TaskComments };