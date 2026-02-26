import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database';

class WPTypes extends Model {
    public wpTypeId!: number;
    public wpTypeName!: string;
}

WPTypes.init({
    wpTypeId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, field: 'WPTypeId' },
    wpTypeName: { type: DataTypes.STRING(100), allowNull: false, unique: true, field: 'WPTypeName' }
}, { sequelize, tableName: 'WPTypes', timestamps: false });

export { WPTypes };