import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

// Définition des attributs pour TypeScript
interface UserAttributes {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt?: Date; // Géré par la DB
    lastLoginAt?: Date | null;
}

// Optionnel : Pour la création, l'ID et les dates sont facultatifs
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'isActive'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public email!: string;
    public password!: string;
    public firstName!: string;
    public lastName!: string;
    public isActive!: boolean;
    public createdAt!: Date;
    public lastLoginAt!: Date | null;

    // Les profils seront gérés plus tard via les associations (HasMany/BelongsToMany)
}

User.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        field: 'UserId' // IMPORTANT : Lien avec le nom SQL réel
    },
    email: {
        type: DataTypes.STRING(320), // Adapté à ta base (VARCHAR 320)
        allowNull: false,
        unique: true,
        field: 'Mail', // Lien vers la colonne 'Mail'
        validate: {
            isEmail: true // Correction de la validation
        }
    },
    password: {
        type: DataTypes.STRING(255), // Adapté à ta base (VARCHAR 255)
        allowNull: false,
        field: 'PwdHash' // Lien vers la colonne 'PwdHash'
    },
    firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'UserFirstName' // Lien vers 'UserFirstName'
    },
    lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'UserLastName' // Lien vers 'UserLastName'
    },
    isActive: {
        type: DataTypes.TINYINT, // TINYINT(1) est souvent lu comme boolean par Sequelize, mais TINYINT est plus sûr pour la définition
        defaultValue: 1,
        allowNull: false,
        field: 'IsActive'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'CreatedAt'
    },
    lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'LastLoginAt'
    }
}, {
    tableName: "Users",
    sequelize,
    timestamps: true,      // On veut gérer les timestamps
    createdAt: 'createdAt', // On mappe la propriété interne createdAt sur la colonne définie plus haut
    updatedAt: false,      // IMPORTANT : Ta table Users n'a pas de colonne UpdatedAt, donc on désactive
});

export default User;