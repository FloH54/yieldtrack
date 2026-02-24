USE yieldtrack;

-- ============================================================
-- 1. DONNÉES DE RÉFÉRENCE (CONSTANTES)
-- ============================================================

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

-- Utilisateurs (Mots de passe hachés fictifs)
INSERT INTO Users (Mail, PwdHash, UserFirstName, UserLastName) VALUES
                                                                   ('alice@yieldtrack.io',   '$2a$12$R9h...AdminHash', 'Alice', 'Admin'),      -- Id 1
                                                                   ('david@yieldtrack.io',   '$2a$12$7kG...KeyUserHash', 'David', 'KeyUser'),  -- Id 2
                                                                   ('bob@yieldtrack.io',     '$2a$12$K1S...ProgMgrHash', 'Bob', 'Manager'),    -- Id 3
                                                                   ('eve@yieldtrack.io',     '$2a$12$7kG...ProgLdrHash', 'Eve', 'Leader'),     -- Id 4
                                                                   ('frank@yieldtrack.io',   '$2a$12$7kG...TeamMgrHash', 'Frank', 'TechLead'), -- Id 5
                                                                   ('charlie@yieldtrack.io', '$2a$12$P7V...ContribHash', 'Charlie', 'Dev');    -- Id 6

-- Rôles Globaux
INSERT INTO LinkUsersProfiles (UserId, ProfileId) VALUES
                                                      (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6);

-- Contrats de travail
INSERT INTO ContractHours (UserId, UnitId, StartDate, WeeklyHours) VALUES
                                                                       (3, 1, '2026-01-01', 40), -- Bob
                                                                       (5, 2, '2026-01-01', 38), -- Frank
                                                                       (6, 3, '2026-01-01', 35); -- Charlie

-- ============================================================
-- 3. PROJETS & STRUCTURE (WORKPACKAGES)
-- ============================================================

-- Création du Projet
INSERT INTO Projects (ProjectName,Slug, CreatorUserId, StartDate, EndDate) VALUES
    ('YieldTrack ERP v1', 'yieldtrack-project',3, '2026-02-01', '2026-12-31');
-- ID du projet = 1

-- Structure des Lots (WorkPackages)
-- Note : On lie maintenant au ProjectId (1) et on ajoute WPName
INSERT INTO WorkPackages (ProjectId, WPName, AccountNumber, WPTypeId, FatherWPId) VALUES
                                                                                      (1, 'Pilotage & Gouvernance', 'PRJ-2026-MGT', 1, NULL),       -- WPId 1 (Racine Management)
                                                                                      (1, 'Infrastructure & DevOps', 'PRJ-2026-INFRA', 4, 1),       -- WPId 2 (Sous-lot Infra)
                                                                                      (1, 'Développement Core',      'PRJ-2026-DEV', 2, 1),         -- WPId 3 (Sous-lot Dev)
                                                                                      (1, 'UX/UI Design',            'PRJ-2026-DSGN', 3, 1);        -- WPId 4 (Sous-lot Design)

-- ============================================================
-- 4. CONTRIBUTEURS (RÔLES SUR LE PROJET)
-- ============================================================

INSERT INTO WPContributors (WPId, UserId, ProfileId) VALUES
-- Sur le lot Pilotage (WP1)
(1, 3, 3), -- Bob (Manager)
(1, 4, 4), -- Eve (Leader)
-- Sur le lot Infra (WP2)
(2, 1, 1), -- Alice (Admin Système pour l'occasion)
(2, 5, 5), -- Frank (Tech Lead)
-- Sur le lot Dev (WP3)
(3, 5, 5), -- Frank
(3, 6, 6), -- Charlie (Dev)
-- Sur le lot Design (WP4)
(4, 2, 2); -- David (Key User / Product Owner)

-- ============================================================
-- 5. TÂCHES (POUR CHAQUE UTILISATEUR)
-- ============================================================

INSERT INTO Tasks (WPId, AssigneeUserId, TaskFUPTypeId, TaskName, TaskBudgetMinutes, Status, Priority, CodeId) VALUES

-- Tâches pour ALICE (Admin/Infra) - WP2
(2, 1, 1, 'Audit sécurité des accès serveurs', 240, 'To Do', 1, 1),
(2, 1, 1, 'Configuration des certificats SSL', 120, 'Done', 2, 1),

-- Tâches pour DAVID (Key User/Design) - WP4
(4, 2, 1, 'Validation des maquettes Mobile (S25+)', 480, 'In Progress', 2, 2),
(4, 2, 1, 'Rédaction des User Stories', 600, 'Assigned', 3, 2),

-- Tâches pour BOB (Program Manager) - WP1
(1, 3, 2, 'Validation budgétaire Q1', 120, 'Done', 1, 1),
(1, 3, 2, 'Préparation Comité de Pilotage', 240, 'To Do', 2, 1),

-- Tâches pour EVE (Program Leader) - WP1
(1, 4, 2, 'Planification du Sprint 1', 240, 'In Progress', 1, 1),
(1, 4, 1, 'Revue des risques projet', 180, 'Assigned', 2, 1),

-- Tâches pour FRANK (Team Manager/Tech Lead) - WP2 & WP3
(2, 5, 1, 'Installation Environnement Fedora Server', 300, 'Done', 1, 3),
(3, 5, 1, 'Code Review : Module Authentification', 180, 'To Do', 2, 3),

-- Tâches pour CHARLIE (Contributor/Dev) - WP3
(3, 6, 1, 'Implémentation API Login', 600, 'In Progress', 1, 3),
(3, 6, 1, 'Optimisation requêtes MariaDB', 420, 'Assigned', 2, 3),
(3, 6, 1, 'Responsive Design S25+', 300, 'To Do', 3, 3);

-- ============================================================
-- 6. TIMELINE & COMMENTAIRES
-- ============================================================

-- Quelques temps passés (RWs)
INSERT INTO RWs (TaskId, UserId, RWDate, RWMinutes) VALUES
                                                        (5, 1, '2026-02-18', 120), -- Alice a bossé sur les certificats
                                                        (7, 3, '2026-02-18', 60),  -- Bob a bossé sur le budget
                                                        (11, 5, '2026-02-17', 300), -- Frank a installé le serveur Fedora
                                                        (13, 6, '2026-02-18', 240); -- Charlie code l'API

-- Discussions
INSERT INTO TaskComments (TaskId, UserId, Content) VALUES
                                                       (11, 5, 'Serveur Fedora opérationnel. J\'ai mis à jour le script d\'init.'),
                                                       (13, 5, 'Frank: Charlie, pense à vérifier la compatibilité des tokens JWT.'),
                                                       (13, 6, 'Charlie: C\'est noté, je teste ça depuis mon poste Fedora aussi.');