import { DataTypes, Model} from "sequelize";
import sequelize from "../../config/database";

class UserToUnits extends Model {
    public userId!: number;
    public unitId!: number;
    public weeklyHours!: number;
    public startDate!: Date;
    public endDate!: Date;
}

UserToUnits.init({
    userId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, field: 'UserId' },
    unitId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, field: 'UnitId' },
    weeklyHours: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'WeeklyHours' },
    startDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'StartDate' },
    endDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'EndDate' }
    }, { sequelize, tableName: 'UserToUnits', timestamps: false
})

export { UserToUnits }