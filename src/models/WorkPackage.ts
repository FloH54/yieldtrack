import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class WorkPackage extends Model {
    public id!: number;
    public projectId!: number;
    public wpName!: string;
    public slug!: string;
    public accountNumber!: string;
    public wpTypeId!: number;
    public fatherWPId!: number | null;
}

WorkPackage.init(
    {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, field: 'WPId' },
        projectId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'ProjectId' },
        wpName: { type: DataTypes.STRING(255), allowNull: false, field: 'WPName' },
        slug: { type: DataTypes.STRING(255), allowNull: false, unique: true, field: 'Slug' },
        accountNumber: { type: DataTypes.STRING(50), allowNull: false, field: 'AccountNumber' },
        wpTypeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'WPTypeId' },
        fatherWPId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'FatherWPId' }
    },
    { sequelize, tableName: 'WorkPackages', timestamps: false }
);

export { WorkPackage };