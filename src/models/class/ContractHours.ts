import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database';

class ContractHours extends Model {
    public chId!: number;
    public userId!: number;
    public unitId!: number;
    public startDate!: Date;
    public endDate!: Date | null;
    public weeklyHours!: number;
}

ContractHours.init({
    chId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, field: 'CHId' },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'UserId' },
    unitId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'UnitId' },
    startDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'StartDate' },
    endDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'EndDate' },
    weeklyHours: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'WeeklyHours' }
}, { sequelize, tableName: 'ContractHours', timestamps: false });

export { ContractHours };