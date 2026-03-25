import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database';

class ProjectLeaders extends Model {
    public projectId!: number;
    public userId!: number;
}

ProjectLeaders.init(
    {
        projectId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, field: 'ProjectId' },
        userId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, field: 'UserId' }
    },
    { sequelize, tableName: 'ProjectLeaders', timestamps: false }
);

export { ProjectLeaders };