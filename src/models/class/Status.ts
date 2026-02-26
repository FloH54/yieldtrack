import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database';

class Status extends Model {
    public statId!: number;
    public statName!: string;
}

Status.init({
    statId: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        field: 'StatId'
    },
    statName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: 'StatName'
    }
}, {
    sequelize,
    tableName: 'Status',
    timestamps: false
});

export { Status };