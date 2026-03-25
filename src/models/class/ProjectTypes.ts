import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database';

class ProjectTypes extends Model {
    public projectTypeId!: number;
    public projectTypeName!: string;
}

ProjectTypes.init({
    projectTypeId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, field: 'ProjectTypeId' },
    projectTypeName: { type: DataTypes.STRING(100), allowNull: false, unique: true, field: 'ProjectTypeName' }
}, { sequelize, tableName: 'ProjectTypes', timestamps: false });

export { ProjectTypes };