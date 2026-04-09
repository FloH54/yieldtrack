USE yieldtrack;

-- ============================================================
-- 1. CONSTANTS & REFERENCE DATA (ENGLISH)
-- ============================================================

INSERT INTO Status (StatId, StatName) VALUES
                                          (1, 'Active'),
                                          (2, 'Canceled'),
                                          (3, 'On Hold'),
                                          (4, 'Completed');

INSERT INTO Profiles (ProfileId, ProfileName) VALUES
                                                  (1, 'Administrator'),
                                                  (2, 'Key User'),
                                                  (3, 'Program Manager'),
                                                  (4, 'Program Leader'),
                                                  (5, 'Team Manager'),
                                                  (6, 'Contributor');

INSERT INTO ProjectTypes (ProjectTypeId, ProjectTypeName) VALUES
                                                              (1, 'Corporate Template'),
                                                              (2, 'Template'),
                                                              (3, 'Production');

INSERT INTO TaskFUPTypes (TaskFUPTypeId, TaskFUPTypeName) VALUES
                                                              (1, 'Progress %'),
                                                              (2, 'Remaining Hours');

INSERT INTO Units (UnitId, UnitName, FatherUnitId) VALUES
    (1, 'Company', NULL);

INSERT INTO Codes (CodeId, CodeName) VALUES
                                         (1, 'Internal'),
                                         (2, 'External');

-- ============================================================
-- 2. SYSTEM ADMIN
-- ============================================================

INSERT INTO Users (UserId, Mail, PwdHash, UserFirstName, UserLastName, IsActive) VALUES
    (1, 'admin@yieldtrack.io', '$2a$12$RR4bABgAmbjrTojVhl.wDOYLmmjvwvEGIEpftQtfXlWZkccvh1RrS', 'System', 'Admin', 1);

-- CORRECTION : Profiles_Users devient LinkUsersProfiles
INSERT INTO LinkUsersProfiles (ProfileId, UserId) VALUES
    (1, 1);

-- CORRECTION : Ajout de la valeur obligatoire StartDate
INSERT INTO UserToUnits (UserId, UnitId, StartDate) VALUES
    (1, 1, '2024-01-01');