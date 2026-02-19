import { DataTypes, Model} from "sequelize";
import sequelize from "../config/database";

class Role extends Model {
    public id! : string;
    public name!: string;
}

Role.init({
    id:{
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        field:'RoleId'
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique:true,
        field:'RoleName'
    }
},{
    tableName: 'Roles',
    sequelize,
    timestamps: false
});
export { Role };