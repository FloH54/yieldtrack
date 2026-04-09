/**
 * Énumération des rôles (Profils) basée sur les IDs de la base de données.
 * Cela évite d'utiliser des "magic numbers" dans le code.
 */
export enum Roles {
    ADMINISTRATOR = 1,
    KEY_USER = 2,
    PROGRAM_MANAGER = 3,
    PROGRAM_LEADER = 4,
    TEAM_MANAGER = 5,
    CONTRIBUTOR = 6
}