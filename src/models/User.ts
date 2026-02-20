import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class User extends Model {
    public UserId!: number;
    public Mail!: string;
    public PwdHash!: string;
    public UserFirstName!: string;
    public UserLastName!: string;
    public IsActive!: boolean;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            field: 'UserId',
        },
        email: {
            type: DataTypes.STRING(320),
            unique: true,
            allowNull: false,
            field: 'Mail',
        },
        pwd: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'PwdHash',
        },
        firstName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'UserFirstName',
        },
        lastName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'UserLastName',
        },
        IsActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true, // Dans le SQL, la valeur par défaut est 1 (true)
        },
        CreatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        LastLoginAt: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    },
    {
        sequelize,
        tableName: 'Users',
        timestamps: false, // On désactive les timestamps automatiques de Sequelize pour utiliser ceux du SQL
    }
);

export default User;