USE yieldtrack;

-- 1. Profils et Types de base
INSERT INTO Profiles (ProfileName) VALUES
                                       ('Administrateur'),
                                       ('Key User'),
                                       ('Chef de Projet'),
                                       ('Team Manager'),
                                       ('Contributeur');

INSERT INTO WPTypes (WPTypeName) VALUES
                                     ('Développement'),
                                     ('Design'),
                                     ('Gestion');

INSERT INTO TaskFUPTypes (TaskFUPTypeName) VALUES
                                               ('Avancement %'),
                                               ('Heures restant à faire');

INSERT INTO Codes (CodeName) VALUES
                                 ('R&D'),
                                 ('Client Direct');

INSERT INTO Units (UnitName, FatherUnitId) VALUES
                                               ('Direction Technique', NULL),
                                               ('Pôle Web', 1);

-- 2. Utilisateurs
INSERT INTO Users (Mail, PwdHash, UserFirstName, UserLastName) VALUES
                                                                   ('alice@yieldtrack.io', '$2a$12$R9h/lIPzHZluvV6.S5N19e27H9kG9.tD20TqPzV8.n.fVpL9tI9te', 'Alice', 'Admin'),
                                                                   ('bob@yieldtrack.io', '$2a$12$K1S4C./Fz4Uv5lI0V6U.XeY13tW/S7.dG7W/YmX2Z8p7J7M6O5n9e', 'Bob', 'Manager'),
                                                                   ('charlie@yieldtrack.io', '$2a$12$P7V6D.Q7W8E9R0T1Y2U3I4O5P6A7S8D9F0G1H2J3K4L5M6N7B8V9C', 'Charlie', 'Dev');

-- 3. Droits globaux et Contrats
INSERT INTO LinkUsersProfiles (UserId, ProfileId) VALUES
                                                      (1, 1),
                                                      (2, 2),
                                                      (3, 3);

INSERT INTO ContractHours (UserId, UnitId, StartDate, WeeklyHours) VALUES
    (3, 2, '2026-01-01', 35);

-- 4. Structure de projet (WorkPackages)
INSERT INTO WorkPackages (AccountNumber, WPTypeId, FatherWPId) VALUES
                                                                   ('PRJ-2026-001', 1, NULL),      -- WPId 1: Projet Global
                                                                   ('PRJ-2026-001-DB', 1, 1);    -- WPId 2: Sous-lot Base de données rattaché au 1

INSERT INTO WPContributors (WPId, UserId, ProfileId) VALUES
                                                         (1, 2, 2),
                                                         (2, 3, 3);

-- 5. Tâches
INSERT INTO Tasks (WPId, AssigneeUserId, TaskFUPTypeId, TaskName, TaskBudgetMinutes, Status, Priority) VALUES
                                                                                                           (2, 3, 1, 'Création du schéma MariaDB', 480, 'In Progress', 1),
                                                                                                           (2, 3, 2, 'Optimisation des index', 240, 'Assigned', 2);

-- 6. Réalisé (RWs) et Commentaires
INSERT INTO RWs (TaskId, UserId, RWDate, RWMinutes) VALUES
    (1, 3, '2026-02-17', 120);

INSERT INTO TaskComments (TaskId, UserId, Content) VALUES
    (1, 3, 'Structure initiale déployée sur Fedora. Tout fonctionne parfaitement avec l\'interclassement utf8mb4_uca1400_ai_ci.');