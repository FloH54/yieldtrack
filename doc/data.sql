USE yieldtrack;

-- ============================================================
-- 1. DONNÉES DE RÉFÉRENCE (CONSTANTES)
-- ============================================================

-- Table des Statuts (Ajoutée pour correspondre à la structure demandée)
INSERT INTO Status (StatName) VALUES
                                  ('actif'),      -- ID 1
                                  ('canceled'),   -- ID 2
                                  ('on hold'),    -- ID 3
                                  ('completed');  -- ID 4

-- Profils
INSERT INTO Profiles (ProfileName) VALUES
                                       ('Administrateur'),
                                       ('Key User'),
                                       ('Program Manager'),
                                       ('Program Leader'),
                                       ('Team Manager'),
                                       ('Contributor');

-- Types de WorkPackages
INSERT INTO WPTypes (WPTypeName) VALUES
                                     ('Gouvernance'),
                                     ('Développement'),
                                     ('Design'),
                                     ('Infrastructure');

-- Types de Suivi
INSERT INTO TaskFUPTypes (TaskFUPTypeName) VALUES
                                               ('Avancement %'),
                                               ('Heures restant à faire');

-- Unités (Organisation)
INSERT INTO Units (UnitName, FatherUnitId) VALUES
                                               ('Direction Générale', NULL),
                                               ('Direction Technique', 1),
                                               ('Pôle Web', 2),
                                               ('Pôle Mobile', 2);

-- Codes Analytiques
INSERT INTO Codes (CodeName) VALUES ('CAPEX'), ('OPEX'), ('R&D');

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

INSERT INTO ContractHours (UserId, UnitId, StartDate, WeeklyHours) VALUES
                                                                       (3, 1, '2026-01-01', 4),
                                                                       (5, 2, '2026-01-01', 3),
                                                                       (6, 3, '2026-01-01', 3);

-- ============================================================
-- 3. PROJETS & STRUCTURE (WORKPACKAGES)
-- ============================================================

-- Création du Projet avec son Slug
INSERT INTO Projects (ProjectName, Slug, CreatorUserId, StartDate, EndDate, StatId) VALUES
    ('YieldTrack ERP v1', 'yieldtrack-project', 3, '2026-02-01', '2026-12-31',1);

-- Structure des Lots (WorkPackages) incluant les Slugs obligatoires
INSERT INTO WorkPackages (ProjectId, WPName, Slug, AccountNumber, WPTypeId, FatherWPId, StatId) VALUES
                                                                                            (1, 'Pilotage & Gouvernance', 'pilotage-gouvernance', 'PRJ-2026-MGT', 1, NULL,1),
                                                                                            (1, 'Infrastructure & DevOps', 'infra-devops', 'PRJ-2026-INFRA', 4, 1,1),
                                                                                            (1, 'Développement Core', 'dev-core', 'PRJ-2026-DEV', 2, 1,1),
                                                                                            (1, 'UX/UI Design', 'ux-ui-design', 'PRJ-2026-DSGN', 3, 1,1);

-- ============================================================
-- 4. CONTRIBUTEURS (RÔLES SUR LE PROJET)
-- ============================================================

INSERT INTO WPContributors (WPId, UserId, ProfileId) VALUES
                                                         (1, 3, 3), (1, 4, 4), -- Pilotage
                                                         (2, 1, 1), (2, 5, 5), -- Infra
                                                         (3, 5, 5), (3, 6, 6), -- Dev
                                                         (4, 2, 2);            -- Design

-- ============================================================
-- 5. TÂCHES (POUR CHAQUE UTILISATEUR)
-- ============================================================

-- Les statuts utilisent désormais StatId (1: actif, 4: completed)
INSERT INTO Tasks (WPId, AssigneeUserId, TaskFUPTypeId, TaskName, TaskBudgetHours, StatId, Priority, CodeId) VALUES

-- ALICE
(2, 1, 1, 'Audit sécurité des accès serveurs', 240, 1, 1, 1),
(2, 1, 1, 'Configuration des certificats SSL', 120, 4, 2, 1),

-- DAVID
(4, 2, 1, 'Validation des maquettes Mobile (S25+)', 480, 1, 2, 2),
(4, 2, 1, 'Rédaction des User Stories', 600, 1, 3, 2),

-- BOB
(1, 3, 2, 'Validation budgétaire Q1', 120, 4, 1, 1),
(1, 3, 2, 'Préparation Comité de Pilotage', 240, 1, 2, 1),

-- EVE
(1, 4, 2, 'Planification du Sprint 1', 240, 1, 1, 1),
(1, 4, 1, 'Revue des risques projet', 180, 1, 2, 1),

-- FRANK
(2, 5, 1, 'Installation Environnement Fedora Server', 300, 4, 1, 3),
(3, 5, 1, 'Code Review : Module Authentification', 180, 1, 2, 3),

-- CHARLIE
(3, 6, 1, 'Implémentation API Login', 600, 1, 1, 3),
(3, 6, 1, 'Optimisation requêtes MariaDB', 420, 1, 2, 3),
(3, 6, 1, 'Responsive Design S25+', 300, 1, 3, 3);

-- ============================================================
-- 6. TIMELINE & COMMENTAIRES
-- ============================================================

INSERT INTO RWs (TaskId, UserId, RWDate, RWHours) VALUES
                                                        (5, 1, '2026-02-18', 120),
                                                        (7, 3, '2026-02-18', 60),
                                                        (11, 5, '2026-02-17', 300),
                                                        (13, 6, '2026-02-18', 240);

INSERT INTO TaskComments (TaskId, UserId, Content) VALUES
                                                       (11, 5, 'Serveur Fedora opérationnel. J\'ai mis à jour le script d\'init.'),
                                                       (13, 5, 'Frank: Charlie, pense à vérifier la compatibilité des tokens JWT.'),
                                                       (13, 6, 'Charlie: C\'est noté, je teste ça depuis mon poste Fedora aussi.');



INSERT INTO UserToUnits (UserId, UnitId, WeeklyHours, StartDate) VALUES
                                                                     (1, 3, 25, '2026-01-01'), -- Charlie au Pôle Web (25h)
                                                                     (2, 4, 10, '2026-01-01'); -- Charlie au Pôle Mobile (10h)