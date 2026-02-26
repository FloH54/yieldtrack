import User from './class/User';
import { Profiles } from './class/Profiles';
import { Project } from './class/Project';
import { WorkPackage } from './class/WorkPackage';
import { Task } from './class/Task';
import { WPContributor } from './class/WPContributor';
import {Status} from "./class/Status";
import {RWs} from "./class/RWs";


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

// Relation avec les statuts (pour régler votre erreur précédente)
Status.hasMany(Task, { foreignKey: 'StatId', as: 'tasks' });
Task.belongsTo(Status, { foreignKey: 'StatId', as: 'status' });

// Relation entre task er remainingwork
Task.hasMany(RWs, { foreignKey: 'taskId', as: 'RWs' });
RWs.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

export {
    User,
    Profiles,
    Project,
    WorkPackage,
    Task,
    WPContributor,
    Status,
    RWs
};