import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database';

class Codes extends Model {
    public codeId!: number;
    public codeName!: string;
}

Codes.init({
    codeId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, field: 'CodeId' },
    codeName: { type: DataTypes.STRING(120), allowNull: false, unique: true, field: 'CodeName' }
}, { sequelize, tableName: 'Codes', timestamps: false });

export { Codes };