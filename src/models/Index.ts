import User from './User';
import { Profiles } from './Profiles';

// Un utilisateur peut avoir plusieurs profils
User.belongsToMany(Profiles, {
    through: 'LinkUsersProfiles', // Le nom exact de la table de jointure dans le SQL
    foreignKey: 'UserId',
    otherKey: 'ProfileId',
    as: 'profiles', // L'alias utilisé lors des requêtes (ex: include: ['profiles'])
    timestamps: false
});

// Un profil peut appartenir à plusieurs utilisateurs
Profiles.belongsToMany(User, {
    through: 'LinkUsersProfiles',
    foreignKey: 'ProfileId',
    otherKey: 'UserId',
    as: 'users',
    timestamps: false
});

export { User, Profiles };