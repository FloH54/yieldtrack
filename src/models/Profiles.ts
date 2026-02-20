import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Profiles extends Model {
    public ProfileId!: number;
    public ProfileName!: string;
}

Profiles.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            field: 'ProfileId',
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            field: 'ProfileName',
        }
    },
    {
        sequelize,
        tableName: 'Profiles',
        timestamps: false,
    }
);

export { Profiles };