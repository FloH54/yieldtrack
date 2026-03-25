SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE DATABASE IF NOT EXISTS yieldtrack
CHARACTER SET utf8mb4
COLLATE utf8mb4_uca1400_ai_ci;

USE yieldtrack;

-- ==========================================
-- 1. TABLES INDÉPENDANTES
-- ==========================================

CREATE TABLE IF NOT EXISTS Users (
                                     UserId INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                     Mail VARCHAR(320) NOT NULL,
    PwdHash VARCHAR(255) NOT NULL,
    UserFirstName VARCHAR(100) NOT NULL,
    UserLastName VARCHAR(100) NOT NULL,
    IsActive TINYINT(1) NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    LastLoginAt DATETIME NULL,
    PRIMARY KEY (UserId),
    UNIQUE KEY UK_Users_Mail (Mail)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Status (
                                      StatId INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                      StatName VARCHAR(100) NOT NULL,
    PRIMARY KEY (StatId),
    UNIQUE KEY UK_Stat_Name (StatName)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Profiles (
                                        ProfileId INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                        ProfileName VARCHAR(100) NOT NULL,
    PRIMARY KEY (ProfileId),
    UNIQUE KEY UK_Profiles_Name (ProfileName)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Remplacement de WPTypes par ProjectTypes
CREATE TABLE IF NOT EXISTS ProjectTypes (
                                            ProjectTypeId INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                            ProjectTypeName VARCHAR(100) NOT NULL,
    PRIMARY KEY (ProjectTypeId),
    UNIQUE KEY UK_ProjectTypes_Name (ProjectTypeName)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Codes (
                                     CodeId INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                     CodeName VARCHAR(120) NOT NULL,
    PRIMARY KEY (CodeId),
    UNIQUE KEY UK_Codes_Name (CodeName)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TaskFUPTypes (
                                            TaskFUPTypeId INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                            TaskFUPTypeName VARCHAR(120) NOT NULL,
    PRIMARY KEY (TaskFUPTypeId),
    UNIQUE KEY UK_TaskFUPTypes_Name (TaskFUPTypeName)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Units (
                                     UnitId INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                     UnitName VARCHAR(150) NOT NULL,
    FatherUnitId INT UNSIGNED NULL,
    PRIMARY KEY (UnitId),
    KEY IX_Units_FatherUnitId (FatherUnitId),
    CONSTRAINT FK_Units_Father FOREIGN KEY (FatherUnitId) REFERENCES Units (UnitId) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ==========================================
-- 2. TABLES DÉPENDANTES (Niveau 1)
-- ==========================================

CREATE TABLE IF NOT EXISTS LinkUsersProfiles (
                                                 UserId INT UNSIGNED NOT NULL,
                                                 ProfileId INT UNSIGNED NOT NULL,
                                                 PRIMARY KEY (UserId, ProfileId),
    CONSTRAINT FK_LUP_User FOREIGN KEY (UserId) REFERENCES Users (UserId) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_LUP_Profile FOREIGN KEY (ProfileId) REFERENCES Profiles (ProfileId) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ajout de ProjectTypeId dans les Projets
CREATE TABLE IF NOT EXISTS Projects (
                                        ProjectId INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                        ProjectName VARCHAR(255) NOT NULL,
    Slug VARCHAR(255) NOT NULL,
    CreatorUserId INT UNSIGNED NOT NULL,
    ProjectTypeId INT UNSIGNED NOT NULL,
    StartDate DATE NULL,
    EndDate DATE NULL,
    StatId INT UNSIGNED NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (ProjectId),
    KEY IX_Projects_CreatorUserId (CreatorUserId),
    KEY IX_Projects_ProjectTypeId (ProjectTypeId),
    KEY IX_Projects_StatId (StatId),
    CONSTRAINT FK_Projects_Creator FOREIGN KEY (CreatorUserId) REFERENCES Users (UserId) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT FK_Projects_ProjectType FOREIGN KEY (ProjectTypeId) REFERENCES ProjectTypes (ProjectTypeId) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT FK_Projects_Status FOREIGN KEY (StatId) REFERENCES Status (StatId) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Nouvelle table : ProjectLeaders (remplace WPContributors pour la gestion des accès P.Leader)
CREATE TABLE IF NOT EXISTS ProjectLeaders (
                                              ProjectId INT UNSIGNED NOT NULL,
                                              UserId INT UNSIGNED NOT NULL,
                                              PRIMARY KEY (ProjectId, UserId),
    CONSTRAINT FK_PL_Project FOREIGN KEY (ProjectId) REFERENCES Projects (ProjectId) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_PL_User FOREIGN KEY (UserId) REFERENCES Users (UserId) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ContractHours (
                                             CHId INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                             UserId INT UNSIGNED NOT NULL,
                                             UnitId INT UNSIGNED NOT NULL,
                                             StartDate DATE NOT NULL,
                                             EndDate DATE NULL,
                                             WeeklyHours INT UNSIGNED NOT NULL,
                                             PRIMARY KEY (CHId),
    KEY IX_CH_UserId (UserId),
    KEY IX_CH_UnitId (UnitId),
    KEY IX_CH_Period (UserId, StartDate, EndDate),
    CONSTRAINT FK_CH_User FOREIGN KEY (UserId) REFERENCES Users (UserId) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_CH_Unit FOREIGN KEY (UnitId) REFERENCES Units (UnitId) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS UserToUnits (
                                           UserId INT UNSIGNED NOT NULL,
                                           UnitId INT UNSIGNED NOT NULL,
                                           WeeklyHours INT UNSIGNED NOT NULL DEFAULT 0,
                                           StartDate DATE NOT NULL,
                                           EndDate DATE NULL,
                                           PRIMARY KEY (UserId, UnitId),
    CONSTRAINT FK_U2U_User FOREIGN KEY (UserId) REFERENCES Users (UserId) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_U2U_Unit FOREIGN KEY (UnitId) REFERENCES Units (UnitId) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ==========================================
-- 3. TABLES DÉPENDANTES (Niveau 2 et +)
-- ==========================================

-- Suppression de WPTypeId dans WorkPackages
CREATE TABLE IF NOT EXISTS WorkPackages (
                                            WPId INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                            ProjectId INT UNSIGNED NOT NULL,
                                            WPName VARCHAR(255) NOT NULL,
    Slug VARCHAR(255) NOT NULL,
    AccountNumber VARCHAR(50) NOT NULL,
    FatherWPId INT UNSIGNED NULL,
    StatId INT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (WPId),
    KEY IX_WorkPackages_ProjectId (ProjectId),
    KEY IX_WorkPackages_FatherWPId (FatherWPId),
    KEY IX_WorkPackages_StatId (StatId),
    CONSTRAINT FK_WP_Project FOREIGN KEY (ProjectId) REFERENCES Projects (ProjectId) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_WP_Father FOREIGN KEY (FatherWPId) REFERENCES WorkPackages (WPId) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT FK_WP_Status FOREIGN KEY (StatId) REFERENCES Status (StatId) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Tasks (
                                     TaskId INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                     WPId INT UNSIGNED NOT NULL,
                                     AssigneeUserId INT UNSIGNED NULL,
                                     TaskFUPTypeId INT UNSIGNED NOT NULL,
                                     TaskName VARCHAR(255) NOT NULL,
    UnitId INT UNSIGNED NULL,
    TaskStart DATE NULL,
    TaskEnd DATE NULL,
    TaskBudgetHours INT UNSIGNED NULL,
    CodeId INT UNSIGNED NULL,
    StatId INT UNSIGNED NOT NULL,
    Priority INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (TaskId),
    KEY IX_Tasks_WPId (WPId),
    KEY IX_Tasks_AssigneeUserId (AssigneeUserId),
    KEY IX_Tasks_TaskFUPTypeId (TaskFUPTypeId),
    KEY IX_Tasks_CodeId (CodeId),
    KEY IX_Tasks_StatId (StatId),
    KEY IX_Tasks_UnitId (UnitId),
    CONSTRAINT FK_Tasks_WP FOREIGN KEY (WPId) REFERENCES WorkPackages (WPId) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_Tasks_Assignee FOREIGN KEY (AssigneeUserId) REFERENCES Users (UserId) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT FK_Tasks_FUPType FOREIGN KEY (TaskFUPTypeId) REFERENCES TaskFUPTypes (TaskFUPTypeId) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT FK_Tasks_Code FOREIGN KEY (CodeId) REFERENCES Codes (CodeId) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT FK_Tasks_Status FOREIGN KEY (StatId) REFERENCES Status (StatId) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT FK_Tasks_Unit FOREIGN KEY (UnitId) REFERENCES Units (UnitId) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TaskComments (
                                            CommentId INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                            TaskId INT UNSIGNED NOT NULL,
                                            UserId INT UNSIGNED NOT NULL,
                                            CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                            Content TEXT NOT NULL,
                                            PRIMARY KEY (CommentId),
    KEY IX_TaskComments_TaskId (TaskId),
    KEY IX_TaskComments_UserId (UserId),
    CONSTRAINT FK_TaskComments_Task FOREIGN KEY (TaskId) REFERENCES Tasks (TaskId) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_TaskComments_User FOREIGN KEY (UserId) REFERENCES Users (UserId) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS RWs (
                                   RWId INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                   TaskId INT UNSIGNED NOT NULL,
                                   UserId INT UNSIGNED NOT NULL,
                                   RWDate DATETIME NOT NULL,
                                   RWHours INT UNSIGNED NOT NULL,
                                   CodeId INT UNSIGNED NULL,
                                   Comment TEXT NULL,
                                   PRIMARY KEY (RWId),
    KEY IX_RWs_TaskId (TaskId),
    KEY IX_RWs_UserId (UserId),
    CONSTRAINT FK_RWs_Task FOREIGN KEY (TaskId) REFERENCES Tasks (TaskId) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_RWs_User FOREIGN KEY (UserId) REFERENCES Users (UserId) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_RWs_Code FOREIGN KEY (CodeId) REFERENCES Codes (CodeId) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;