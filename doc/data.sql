USE yieldtrack;

-- ============================================================
-- 1. DONNÉES DE RÉFÉRENCE (CONSTANTES)
-- ============================================================

INSERT INTO Status (StatName) VALUES
                                  ('actif'),      -- ID 1
                                  ('canceled'),   -- ID 2
                                  ('on hold'),    -- ID 3
                                  ('completed');  -- ID 4

INSERT INTO Profiles (ProfileName) VALUES
                                       ('Administrateur'),
                                       ('Key User'),
                                       ('Program Manager'),
                                       ('Program Leader'),
                                       ('Team Manager'),
                                       ('Contributor');

-- Nouveaux Types de Projets
INSERT INTO ProjectTypes (ProjectTypeName) VALUES
                                               ('Corporate Template'),
                                               ('Template'),
                                               ('Production');

INSERT INTO TaskFUPTypes (TaskFUPTypeName) VALUES
                                               ('Avancement %'),
                                               ('Heures restant à faire');

INSERT INTO Units (UnitName, FatherUnitId) VALUES
    ('Company', null);

INSERT INTO Codes (CodeName) VALUES ('Intern'), ('Extern');

-- ============================================================
-- 2. UTILISATEURS & CONTRATS
-- ============================================================

INSERT INTO Users (Mail, PwdHash, UserFirstName, UserLastName) VALUES
                                                                   ('alice@yieldtrack.io',   '$2a$12$jYSDwPM9HVlTna7.3XyCB.jhuSGgIwVbtC/dKX/kOJVe2edcriG6e', 'Alice', 'Admin'),      -- Id 1
                                                                   ('david@yieldtrack.io',   '$2a$12$jYSDwPM9HVlTna7.3XyCB.jhuSGgIwVbtC/dKX/kOJVe2edcriG6e', 'David', 'KeyUser'),  -- Id 2
                                                                   ('bob@yieldtrack.io',     '$2a$12$jYSDwPM9HVlTna7.3XyCB.jhuSGgIwVbtC/dKX/kOJVe2edcriG6e', 'Bob', 'Manager'),    -- Id 3
                                                                   ('eve@yieldtrack.io',     '$2a$12$jYSDwPM9HVlTna7.3XyCB.jhuSGgIwVbtC/dKX/kOJVe2edcriG6e', 'Eve', 'Leader'),     -- Id 4
                                                                   ('frank@yieldtrack.io',   '$2a$12$jYSDwPM9HVlTna7.3XyCB.jhuSGgIwVbtC/dKX/kOJVe2edcriG6e', 'Frank', 'TechLead'), -- Id 5
                                                                   ('charlie@yieldtrack.io', '$2a$12$jYSDwPM9HVlTna7.3XyCB.jhuSGgIwVbtC/dKX/kOJVe2edcriG6e', 'Charlie', 'Dev');    -- Id 6

INSERT INTO LinkUsersProfiles (UserId, ProfileId) VALUES
                                                      (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6);

-- ============================================================
-- 3. PROJETS & STRUCTURE (WORKPACKAGES)
-- ============================================================

-- Création du Projet en incluant le Type (3 = Production)
INSERT INTO Projects (ProjectName, Slug, CreatorUserId, ProjectTypeId, StartDate, EndDate, StatId) VALUES
    ('YieldTrack ERP v1', 'yieldtrack-project', 3, 3, '2026-02-01', '2026-12-31', 1);

-- Attribution du Program Leader (Eve) au Projet 1
INSERT INTO ProjectLeaders (ProjectId, UserId) VALUES
    (1, 4);

-- Structure des Lots (WorkPackages) sans WPTypeId
INSERT INTO WorkPackages (ProjectId, WPName, Slug, AccountNumber, FatherWPId, StatId) VALUES
                                                                                          (1, 'Pilotage & Gouvernance', 'pilotage-gouvernance', 'PRJ-2026-MGT', NULL, 1),
                                                                                          (1, 'Infrastructure & DevOps', 'infra-devops', 'PRJ-2026-INFRA', 1, 1),
                                                                                          (1, 'Développement Core', 'dev-core', 'PRJ-2026-DEV', 1, 1),
                                                                                          (1, 'UX/UI Design', 'ux-ui-design', 'PRJ-2026-DSGN', 1, 1);

-- ============================================================
-- 4. TÂCHES & SUIVI
-- ============================================================

INSERT INTO Tasks (WPId, AssigneeUserId, TaskFUPTypeId, TaskName, TaskBudgetHours, StatId, Priority, CodeId) VALUES
                                                                                                                 (2, 1, 1, 'Audit sécurité des accès serveurs', 240, 1, 1, 1),
                                                                                                                 (2, 1, 1, 'Configuration des certificats SSL', 120, 4, 2, 1),
                                                                                                                 (4, 2, 1, 'Validation des maquettes Mobile (S25+)', 480, 1, 2, 2),
                                                                                                                 (4, 2, 1, 'Rédaction des User Stories', 600, 1, 3, 2),
                                                                                                                 (1, 3, 2, 'Validation budgétaire Q1', 120, 4, 1, 1),
                                                                                                                 (1, 3, 2, 'Préparation Comité de Pilotage', 240, 1, 2, 1),
                                                                                                                 (1, 4, 2, 'Planification du Sprint 1', 240, 1, 1, 1),
                                                                                                                 (1, 4, 1, 'Revue des risques projet', 180, 1, 2, 1),
                                                                                                                 (2, 5, 1, 'Installation Environnement Fedora Server', 300, 4, 1, 2),
                                                                                                                 (3, 5, 1, 'Code Review : Module Authentification', 180, 1, 2, 2),
                                                                                                                 (3, 6, 1, 'Implémentation API Login', 600, 1, 1, 2),
                                                                                                                 (3, 6, 1, 'Optimisation requêtes MariaDB', 420, 1, 2, 2),
                                                                                                                 (3, 6, 1, 'Responsive Design S25+', 300, 1, 3, 2);

INSERT INTO RWs (TaskId, UserId, RWDate, RWHours) VALUES
                                                      (5, 1, '2026-02-18 10:00:00', 120),
                                                      (7, 3, '2026-02-18 11:30:00', 60),
                                                      (11, 5, '2026-02-17 14:00:00', 300),
                                                      (13, 6, '2026-02-18 09:15:00', 240);