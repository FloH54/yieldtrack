import User from './User';
import { Profiles } from './Profiles';
import { Project } from './Project';
import { WorkPackage } from './WorkPackage';
import { Task } from './Task';
import { WPContributor } from './WPContributor';


// 1. UTILISATEURS ET PROFILS (ROLES GLOBAUX)
User.belongsToMany(Profiles, { through: 'LinkUsersProfiles', foreignKey: 'UserId', otherKey: 'ProfileId', as: 'profiles', timestamps: false });
Profiles.belongsToMany(User, { through: 'LinkUsersProfiles', foreignKey: 'ProfileId', otherKey: 'UserId', as: 'users', timestamps: false });

// 2. PROJETS
// Un utilisateur crée plusieurs projets
User.hasMany(Project, { foreignKey: 'CreatorUserId', as: 'createdProjects' });
Project.belongsTo(User, { foreignKey: 'CreatorUserId', as: 'creator' });

// Un projet contient plusieurs WorkPackages
Project.hasMany(WorkPackage, { foreignKey: 'ProjectId', as: 'workPackages' });
WorkPackage.belongsTo(Project, { foreignKey: 'ProjectId', as: 'project' });

// 3. WORKPACKAGES
// Hiérarchie des WorkPackages (Père -> Enfant)
WorkPackage.hasMany(WorkPackage, { foreignKey: 'FatherWPId', as: 'children' });
WorkPackage.belongsTo(WorkPackage, { foreignKey: 'FatherWPId', as: 'father' });

// WorkPackages et Contributeurs (Table Pivot WPContributors)
WorkPackage.hasMany(WPContributor, { foreignKey: 'WPId', as: 'contributors' });
WPContributor.belongsTo(WorkPackage, { foreignKey: 'WPId', as: 'workPackage' });

User.hasMany(WPContributor, { foreignKey: 'UserId', as: 'wpContributions' });
WPContributor.belongsTo(User, { foreignKey: 'UserId', as: 'user' });

// 4. TÂCHES
// Un WorkPackage contient plusieurs tâches
WorkPackage.hasMany(Task, { foreignKey: 'WPId', as: 'tasks' });
Task.belongsTo(WorkPackage, { foreignKey: 'WPId', as: 'workPackage' });

// Un Utilisateur est assigné à plusieurs tâches
User.hasMany(Task, { foreignKey: 'AssigneeUserId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'AssigneeUserId', as: 'assignee' });

export {
    User,
    Profiles,
    Project,
    WorkPackage,
    Task,
    WPContributor
};