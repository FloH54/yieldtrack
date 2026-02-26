import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database';

class Units extends Model {
    public unitId!: number;
    public unitName!: string;
    public fatherUnitId!: number | null;
}

Units.init({
    unitId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, field: 'UnitId' },
    unitName: { type: DataTypes.STRING(150), allowNull: false, field: 'UnitName' },
    fatherUnitId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'FatherUnitId' }
}, { sequelize, tableName: 'Units', timestamps: false });

export { Units };