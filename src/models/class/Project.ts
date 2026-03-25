import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database';

class Project extends Model {
    public id!: number;
    public projectName!: string;
    public slug!: string;
    public creatorUserId!: number;
    public projectTypeId!: number;
    public startDate!: Date | null;
    public endDate!: Date | null;
    public createdAt!: Date;
    public updatedAt!: Date;
    public statId!: number;
}

Project.init(
    {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, field: 'ProjectId' },
        projectName: { type: DataTypes.STRING(255), allowNull: false, field: 'ProjectName' },
        slug: { type: DataTypes.STRING(255), allowNull: false, unique: true, field: 'Slug' },
        creatorUserId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'CreatorUserId' },
        projectTypeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'ProjectTypeId' },
        startDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'StartDate' },
        endDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'EndDate' },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'CreatedAt' },
        updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'UpdatedAt' },
        statId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1, field: 'StatId' },
    },
    { sequelize, tableName: 'Projects', timestamps: false }
);

export { Project };