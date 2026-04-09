USE yieldtrack;

-- ============================================================
-- 1. CONSTANTS & REFERENCE DATA
-- ============================================================
INSERT INTO Status (StatId, StatName) VALUES
                                          (1, 'Active'), (2, 'Canceled'), (3, 'On Hold'), (4, 'Completed');

INSERT INTO Profiles (ProfileId, ProfileName) VALUES
                                                  (1, 'Administrator'), (2, 'Key User'), (3, 'Program Manager'),
                                                  (4, 'Program Leader'), (5, 'Team Manager'), (6, 'Contributor');

INSERT INTO ProjectTypes (ProjectTypeId, ProjectTypeName) VALUES
                                                              (1, 'Corporate Template'), (2, 'Template'), (3, 'Production');

INSERT INTO TaskFUPTypes (TaskFUPTypeId, TaskFUPTypeName) VALUES
                                                              (1, 'Progress %'), (2, 'Remaining Hours');

INSERT INTO Units (UnitId, UnitName, FatherUnitId) VALUES
                                                       (1, 'Company', NULL),
                                                       (2, 'IT Department', 1),
                                                       (3, 'Marketing', 1),
                                                       (4, 'R&D', 1);

INSERT INTO Codes (CodeId, CodeName) VALUES
                                         (1, 'Internal'), (2, 'External');

-- ============================================================
-- 2. USERS & ROLES
-- ============================================================
INSERT INTO Users (UserId, Mail, PwdHash, UserFirstName, UserLastName, IsActive) VALUES
                                                                                     (1, 'admin@yieldtrack.io', '$2a$12$RR4bABgAmbjrTojVhl.wDOYLmmjvwvEGIEpftQtfXlWZkccvh1RrS', 'System', 'Admin', 1),
                                                                                     (2, 'john.doe@yieldtrack.io', '$2a$12$RR4bABgAmbjrTojVhl.wDOYLmmjvwvEGIEpftQtfXlWZkccvh1RrS', 'John', 'Doe', 1),
                                                                                     (3, 'jane.smith@yieldtrack.io', '$2a$12$RR4bABgAmbjrTojVhl.wDOYLmmjvwvEGIEpftQtfXlWZkccvh1RrS', 'Jane', 'Smith', 1),
                                                                                     (4, 'alice.jones@yieldtrack.io', '$2a$12$RR4bABgAmbjrTojVhl.wDOYLmmjvwvEGIEpftQtfXlWZkccvh1RrS', 'Alice', 'Jones', 0),
                                                                                     (5, 'bob.brown@yieldtrack.io', '$2a$12$RR4bABgAmbjrTojVhl.wDOYLmmjvwvEGIEpftQtfXlWZkccvh1RrS', 'Bob', 'Brown', 1);

-- CORRECTION : Profiles_Users devient LinkUsersProfiles
INSERT INTO LinkUsersProfiles (ProfileId, UserId) VALUES
                                                      (1, 1), (3, 2), (5, 3), (6, 4), (6, 5);

-- CORRECTION : Ajout de la valeur obligatoire StartDate
INSERT INTO UserToUnits (UserId, UnitId, StartDate) VALUES
                                                        (1, 1, '2024-01-01'), (2, 2, '2024-01-01'), (3, 3, '2024-01-01'), (4, 4, '2024-01-01'), (5, 2, '2024-01-01');

-- ============================================================
-- 3. PROJECTS & WORK PACKAGES
-- ============================================================

INSERT INTO Projects (ProjectId, AnalyticalCode, ProjectName, Slug, ProjectTypeId, CreatorUserId, StartDate, EndDate, StatId) VALUES
                                                                                                                                  (1, 'ERP-01', 'ERP Cloud Migration', 'erp-cloud-migration', 3, 1, '2024-01-10', '2024-12-31', 1),
                                                                                                                                  (2, 'MKT-02', 'Summer Marketing Campaign', 'summer-marketing-campaign', 3, 1, '2024-05-01', NULL, 4),
                                                                                                                                  (3, 'TPL-03', 'Standard Software Dev', 'standard-software-dev', 1, 1, NULL, NULL, 1),
                                                                                                                                  (4, 'RD-04', 'AI Prototype Alpha', 'ai-prototype-alpha', 3, 1, '2024-03-15', '2024-08-01', 2);

INSERT INTO ProjectLeaders (ProjectId, UserId) VALUES
                                                   (1, 2), (2, 3), (4, 2);

INSERT INTO WorkPackages (WPId, ProjectId, WPName, Slug, AccountNumber, StatId) VALUES
                                                                                    (1, 1, 'Phase 1 - Infrastructure', 'erp-wp-1', 'ACC-001', 4),
                                                                                    (2, 1, 'Phase 2 - Data Migration', 'erp-wp-2', 'ACC-002', 1),
                                                                                    (3, 2, 'Social Media Ads', 'mkt-wp-1', 'ACC-003', 4),
                                                                                    (4, 3, 'General Setup', 'tpl-wp-1', 'ACC-004', 1),
                                                                                    (5, 4, 'Model Training', 'rd-wp-1', 'ACC-005', 2);
-- ============================================================
-- 4. TASKS
-- ============================================================
-- CORRECTION : UserId -> AssigneeUserId, StartDate -> TaskStart, EndDate -> TaskEnd
INSERT INTO Tasks (TaskId, WPId, UnitId, TaskName, TaskBudgetHours, Priority, StatId, TaskFUPTypeId, AssigneeUserId, TaskStart, TaskEnd) VALUES
                                                                                                                                             (1, 1, 2, 'Server Procurement', 120, 1, 4, 1, 2, '2024-01-10', '2024-02-01'),
                                                                                                                                             (2, 1, 2, 'Network Setup', 80, 2, 4, 2, 5, '2024-02-02', '2024-03-31'),
                                                                                                                                             (3, 2, 2, 'Database Backup', 45, 1, 1, 2, 5, '2024-04-01', NULL),
                                                                                                                                             (4, 2, 2, 'Write Migration Script', NULL, 3, 1, 1, NULL, '2024-04-10', '2024-05-15'),
                                                                                                                                             (5, 2, 2, 'Data Cleaning', 200, 2, 3, 2, 4, NULL, NULL),
                                                                                                                                             (6, 3, 3, 'Design Banners', 50, 1, 4, 2, 3, '2024-05-01', '2024-05-10'),
                                                                                                                                             (7, 4, NULL, 'Define Architecture', NULL, 1, 1, 1, NULL, NULL, NULL),
                                                                                                                                             (8, 5, 4, 'Data collection', 300, 1, 2, 2, 2, '2024-03-15', '2024-06-01');

-- ============================================================
-- 5. REMAINING WORKS (RWs) & COMMENTS
-- ============================================================
INSERT INTO RWs (TaskId, UserId, RWDate, RWHours, CodeId, Comment) VALUES
                                                                       (1, 2, '2024-01-20 10:00:00', 50, 2, 'Waiting for hardware delivery from vendor.'),
                                                                       (1, 2, '2024-01-28 14:00:00', 0, 1, 'Servers received and installed.'),
                                                                       (3, 5, '2024-04-05 09:30:00', 40, NULL, 'Started backups, going well.'),
                                                                       (3, 5, '2024-04-12 16:00:00', 35, 1, 'Minor issue with server space.'),
                                                                       (8, 2, '2024-03-20 11:00:00', 250, 1, 'Data collection is slower than expected.');

INSERT INTO TaskComments (TaskId, UserId, Content) VALUES
                                                       (4, 2, 'We need to define the schema before starting the script.'),
                                                       (5, 3, 'Alice is currently on leave, putting this task on hold.');

-- ============================================================
-- 6. CONTRACT HOURS
-- ============================================================
-- CORRECTION : Adaptation au nouveau format de table (UserId, UnitId, StartDate, EndDate, WeeklyHours)
INSERT INTO ContractHours (UserId, UnitId, StartDate, EndDate, WeeklyHours) VALUES
                                                                                (2, 2, '2024-04-08', '2024-04-21', 40),
                                                                                (5, 2, '2024-04-08', '2024-04-21', 35);