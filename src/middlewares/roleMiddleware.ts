import { Request, Response, NextFunction } from 'express';

export const authorize = (rolesRequired: number[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        // 1. Vérifie si l'utilisateur et ses profils sont bien chargés
        if (!user || !user.profiles) {
            console.error("Erreur Auth: Utilisateur ou user.profiles introuvable");
            return res.status(403).send("Access denied: No profile found");
        }

        // 2. Vérification des droits par ID de profil
        const hasPermissions: boolean = user.profiles.some((profile: any) => {
            // Selon l'objet retourné par Sequelize (.get({plain:true})), on vise 'id' ou 'ProfileId'
            const profileId = profile.id || profile.ProfileId;
            return rolesRequired.includes(profileId);
        });

        if (!hasPermissions) {
            console.warn(`Accès refusé. Les rôles de l'utilisateur ne correspondent pas aux IDs requis : ${rolesRequired}`);
            return res.status(403).send("Access denied: Insufficient permissions");
        }

        next();
    };
};