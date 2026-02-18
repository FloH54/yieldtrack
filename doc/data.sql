USE yieldtrack;

-- 1. Les 6 Profils
INSERT INTO Profiles (ProfileName) VALUES
                                       ('Administrateur'),
                                       ('Key User'),
                                       ('Program Manager'),
                                       ('Program Leader'),
                                       ('Team Manager'),
                                       ('Contributor');

-- 2. Types et Unités de base
INSERT INTO WPTypes (WPTypeName) VALUES ('Gouvernance'), ('Développement'), ('Design');
INSERT INTO TaskFUPTypes (TaskFUPTypeName) VALUES ('Avancement %'), ('Heures restant à faire');
INSERT INTO Units (UnitName, FatherUnitId) VALUES
                                               ('Direction Générale', NULL),
                                               ('Direction Technique', 1),
                                               ('Pôle Web', 2);

-- 3. Utilisateurs (Un pour chaque profil)
INSERT INTO Users (Mail, PwdHash, UserFirstName, UserLastName) VALUES
                                                                   ('alice@yieldtrack.io', '$2a$12$R9h/lIPzHZluvV6.S5N19e27H9kG9.tD20TqPzV8.n.fVpL9tI9te', 'Alice', 'Admin'),
                                                                   ('david@yieldtrack.io', '$2a$12$7kG9.tD20TqPzV8.n.fVpL9tI9teR9h/lIPzHZluvV6.S5N19e2', 'David', 'KeyUser'),
                                                                   ('bob@yieldtrack.io', '$2a$12$K1S4C./Fz4Uv5lI0V6U.XeY13tW/S7.dG7W/YmX2Z8p7J7M6O5n9e', 'Bob', 'ProgManager'),
                                                                   ('eve@yieldtrack.io', '$2a$12$7kG9.tD20TqPzV8.n.fVpL9tI9teR9h/lIPzHZluvV6.S5N19e2', 'Eve', 'ProgLeader'),
                                                                   ('frank@yieldtrack.io', '$2a$12$7kG9.tD20TqPzV8.n.fVpL9tI9teR9h/lIPzHZluvV6.S5N19e2', 'Frank', 'TeamManager'),
                                                                   ('charlie@yieldtrack.io', '$2a$12$P7V6D.Q7W8E9R0T1Y2U3I4O5P6A7S8D9F0G1H2J3K4L5M6N7B8V9C', 'Charlie', 'Contributor');

-- 4. Attribution des rôles globaux (LinkUsersProfiles)
INSERT INTO LinkUsersProfiles (UserId, ProfileId) VALUES
                                                      (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6);

-- 5. Contrats de travail
INSERT INTO ContractHours (UserId, UnitId, StartDate, WeeklyHours) VALUES
                                                                       (3, 1, '2026-01-01', 40), -- Bob (Manager) à 40h
                                                                       (5, 2, '2026-01-01', 38), -- Frank (Team Mgr) à 38h
                                                                       (6, 3, '2026-01-01', 35); -- Charlie (Dev) à 35h

-- 6. Structure de Projet Hiérarchique (WorkPackages)
-- Niveau 1 : Le Programme
INSERT INTO WorkPackages (AccountNumber, WPTypeId, FatherWPId) VALUES ('PRJ-2026-001', 1, NULL);
-- Niveau 2 : Sous-lot technique (rattaché au 1)
INSERT INTO WorkPackages (AccountNumber, WPTypeId, FatherWPId) VALUES ('PRJ-2026-001-TECH', 2, 1);

-- 7. Contributeurs contextuels (Rôles par projet)
INSERT INTO WPContributors (WPId, UserId, ProfileId) VALUES
                                                         (1, 3, 3), -- Bob est Program Manager du projet global
                                                         (1, 4, 4), -- Eve est Program Leader du projet global
                                                         (2, 5, 5), -- Frank est Team Manager du lot technique
                                                         (2, 6, 6); -- Charlie est Contributeur sur le lot technique

-- 8. Tâches et Suivi
INSERT INTO Tasks (WPId, AssigneeUserId, TaskFUPTypeId, TaskName, TaskBudgetMinutes, Status, Priority) VALUES
                                                                                                           (2, 6, 1, 'Mise en place environnement MariaDB', 600, 'In Progress', 1),
                                                                                                           (2, 6, 1, 'Déploiement sur Fedora', 300, 'Assigned', 2);

-- 9. Réalisé (RWs) et Discussion
INSERT INTO RWs (TaskId, UserId, RWDate, RWMinutes) VALUES
    (1, 6, '2026-02-18', 240); -- Charlie a travaillé 4h aujourd'hui

INSERT INTO TaskComments (TaskId, UserId, Content) VALUES
                                                       (1, 5, 'Frank: Charlie, peux-tu confirmer la version de MariaDB utilisée ?'),
                                                       (1, 6, 'Charlie: C\'est la version 11.4, optimisée pour notre config Fedora.');