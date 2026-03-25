import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database';

class WorkPackage extends Model {
    public id!: number;
    public projectId!: number;
    public wpName!: string;
    public slug!: string;
    public accountNumber!: string
    public fatherWPId!: number | null;
    public statId!: number;
}

WorkPackage.init(
    {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, field: 'WPId' },
        projectId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'ProjectId' },
        wpName: { type: DataTypes.STRING(255), allowNull: false, field: 'WPName' },
        slug: { type: DataTypes.STRING(255), allowNull: false, unique: true, field: 'Slug' },
        accountNumber: { type: DataTypes.STRING(50), allowNull: false, field: 'AccountNumber' },
        fatherWPId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'FatherWPId' },
        statId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1, field: 'StatId' }
    },
    { sequelize, tableName: 'WorkPackages', timestamps: false }
);

export { WorkPackage };