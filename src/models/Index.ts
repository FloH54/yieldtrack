import User from './class/User';
import { Profiles } from './class/Profiles';
import { Project } from './class/Project';
import { WorkPackage } from './class/WorkPackage';
import { Task } from './class/Task';
import { WPContributor } from './class/WPContributor';
import { Status } from "./class/Status";
import { RWs } from "./class/RWs";
import {Units} from "./class/Units";


// 1. UTILISATEURS ET PROFILS (ROLES GLOBAUX)
User.belongsToMany(Profiles, { through: 'LinkUsersProfiles', foreignKey: 'UserId', otherKey: 'ProfileId', as: 'profiles', timestamps: false });
Profiles.belongsToMany(User, { through: 'LinkUsersProfiles', foreignKey: 'ProfileId', otherKey: 'UserId', as: 'users', timestamps: false });

// 2. PROJETS
// Un utilisateur crée plusieurs projets
User.hasMany(Project, { foreignKey: 'creatorUserId', as: 'createdProjects' });
Project.belongsTo(User, { foreignKey: 'creatorUserId', as: 'creator' });

// Un projet contient plusieurs WorkPackages
Project.hasMany(WorkPackage, { foreignKey: 'projectId', as: 'workPackages' });
WorkPackage.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// 3. WORKPACKAGES
// Hiérarchie des WorkPackages (Père -> Enfant)
WorkPackage.hasMany(WorkPackage, { foreignKey: 'fatherWPId', as: 'children' });
WorkPackage.belongsTo(WorkPackage, { foreignKey: 'fatherWPId', as: 'father' });

// WorkPackages et Contributeurs (Table Pivot WPContributors)
WorkPackage.hasMany(WPContributor, { foreignKey: 'wpId', as: 'contributors' });
WPContributor.belongsTo(WorkPackage, { foreignKey: 'wpId', as: 'workPackage' });

User.hasMany(WPContributor, { foreignKey: 'userId', as: 'wpContributions' });
WPContributor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 4. TÂCHES
// Un WorkPackage contient plusieurs tâches
WorkPackage.hasMany(Task, { foreignKey: 'wpId', as: 'tasks' });
Task.belongsTo(WorkPackage, { foreignKey: 'wpId', as: 'workPackage' });

// Un Utilisateur est assigné à plusieurs tâches
User.hasMany(Task, { foreignKey: 'assigneeUserId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assigneeUserId', as: 'assignee' });

// Relation avec les statuts (pour régler votre erreur précédente)
Status.hasMany(Task, { foreignKey: 'statId', as: 'tasks' });
Task.belongsTo(Status, { foreignKey: 'statId', as: 'status' });

// Relation entre task.ejs er remainingwork
Task.hasMany(RWs, { foreignKey: 'taskId', as: 'RWs' });
RWs.belongsTo(Task, { foreignKey: 'taskId', as: 'task.ejs' });

// Relation entre task et units
Units.hasMany(Task, { foreignKey: 'unitId', as: 'tasks' });
Task.belongsTo(Units, { foreignKey: 'unitId', as: 'unit' });

export {
    User,
    Profiles,
    Project,
    WorkPackage,
    Task,
    Units,
    WPContributor,
    Status,
    RWs
};