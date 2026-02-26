import { DataTypes, Model, Association } from 'sequelize';
import sequelize from '../../config/database';
import { Profiles } from './Profiles';

class User extends Model {
    // On utilise 'declare' pour que TS comprenne que Sequelize gère ces champs
    declare id: number;           // Mapped to UserId
    declare email: string;        // Mapped to Mail
    declare pwd: string;          // Mapped to PwdHash
    declare firstName: string;    // Mapped to UserFirstName
    declare lastName: string;     // Mapped to UserLastName
    declare IsActive: boolean;

    // Associations (utile pour l'autocomplétion)
    declare profiles?: Profiles[];
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            field: 'UserId', // Le vrai nom en base
        },
        email: {
            type: DataTypes.STRING(320),
            unique: true,
            allowNull: false,
            field: 'Mail', // Le vrai nom en base
        },
        pwd: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'PwdHash', // Le vrai nom en base
        },
        firstName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'UserFirstName', // Le vrai nom en base
        },
        lastName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'UserLastName', // Le vrai nom en base
        },
        IsActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
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
        timestamps: false,
    }
);

export default User;