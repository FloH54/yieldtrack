import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database';

class RWs extends Model {
    public rwId!: number;
    public taskId!: number;
    public userId!: number;
    public rwDate!: Date;
    public rwHours!: number;
}

RWs.init({
    rwId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, field: 'RWId' },
    taskId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'TaskId' },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'UserId' },
    rwDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'RWDate' },
    rwHours: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'RWHours' }
}, { sequelize, tableName: 'RWs', timestamps: false });

export { RWs };