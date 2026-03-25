import User from './class/User';
import { Profiles } from './class/Profiles';
import { Project } from './class/Project';
import { WorkPackage } from './class/WorkPackage';
import { Task } from './class/Task';
import { Status } from "./class/Status";
import { RWs } from "./class/RWs";
import { Units } from "./class/Units";
import { ProjectTypes } from "./class/ProjectTypes";
import { ProjectLeaders } from "./class/ProjectLeaders";
import { UserToUnits } from "./class/UserToUnits";
import { Codes } from "./class/Codes";

// 1. UTILISATEURS ET PROFILS
User.belongsToMany(Profiles, { through: 'LinkUsersProfiles', foreignKey: 'UserId', otherKey: 'ProfileId', as: 'profiles', timestamps: false });
Profiles.belongsToMany(User, { through: 'LinkUsersProfiles', foreignKey: 'ProfileId', otherKey: 'UserId', as: 'users', timestamps: false });

// 2. PROJETS
User.hasMany(Project, { foreignKey: 'creatorUserId', as: 'createdProjects' });
Project.belongsTo(User, { foreignKey: 'creatorUserId', as: 'creator' });

// Types de Projets
ProjectTypes.hasMany(Project, { foreignKey: 'projectTypeId', as: 'projects' });
Project.belongsTo(ProjectTypes, { foreignKey: 'projectTypeId', as: 'type' });

Status.hasMany(Project, { foreignKey: 'statId', as: 'projects' });
Project.belongsTo(Status, { foreignKey: 'statId', as: 'status' });

// Project Leaders
Project.belongsToMany(User, { through: ProjectLeaders, foreignKey: 'ProjectId', otherKey: 'UserId', as: 'leaders', timestamps: false });
User.belongsToMany(Project, { through: ProjectLeaders, foreignKey: 'UserId', otherKey: 'ProjectId', as: 'ledProjects', timestamps: false });

Project.hasMany(WorkPackage, { foreignKey: 'projectId', as: 'workPackages' });
WorkPackage.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// 3. WORKPACKAGES
WorkPackage.hasMany(WorkPackage, { foreignKey: 'fatherWPId', as: 'children' });
WorkPackage.belongsTo(WorkPackage, { foreignKey: 'fatherWPId', as: 'father' });

Status.hasMany(WorkPackage, { foreignKey: 'statId', as: 'workPackages' });
WorkPackage.belongsTo(Status, { foreignKey: 'statId', as: 'status' });

WorkPackage.hasMany(Task, { foreignKey: 'wpId', as: 'tasks' });
Task.belongsTo(WorkPackage, { foreignKey: 'wpId', as: 'workPackage' });

// 4. TÂCHES
User.hasMany(Task, { foreignKey: 'assigneeUserId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assigneeUserId', as: 'assignee' });

Status.hasMany(Task, { foreignKey: 'statId', as: 'tasks' });
Task.belongsTo(Status, { foreignKey: 'statId', as: 'status' });

Task.hasMany(RWs, { foreignKey: 'taskId', as: 'RWs' });
RWs.belongsTo(Task, { foreignKey: 'taskId', as: 'task.ejs' });

Units.hasMany(Task, { foreignKey: 'unitId', as: 'tasks' });
Task.belongsTo(Units, { foreignKey: 'unitId', as: 'unit' });

User.belongsToMany(Units, { through: UserToUnits, foreignKey: 'UserId', timestamps: false });
Units.belongsToMany(User, { through: UserToUnits, foreignKey: 'UnitId', timestamps: false });

Codes.hasMany(RWs, { foreignKey: 'codeId', as: 'rws' });
RWs.belongsTo(Codes, { foreignKey: 'codeId', as: 'code' });

export {
    User,
    Profiles,
    Project,
    ProjectTypes,
    ProjectLeaders,
    WorkPackage,
    Task,
    Units,
    Status,
    RWs,
    Codes
};