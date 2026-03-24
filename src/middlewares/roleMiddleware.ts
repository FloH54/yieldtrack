import { Request, Response, NextFunction } from 'express';

export const authorize = (rolesRequired: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        // 1. Vérifie si l'utilisateur et ses profils sont bien chargés
        if (!user || !user.profiles) {
            console.error("Erreur Auth: Utilisateur ou user.profiles introuvable");
            return res.status(403).send("Accès refusé : Aucun profil trouvé");
        }

        // 3. Vérification des droits avec tolérance sur la casse (ProfileName ou profileName)
        const hasPermissions: boolean = user.profiles.some((profile: any) => {
            // On récupère le nom du profil qu'il soit écrit avec une majuscule ou minuscule
            const roleName = profile.profileName || profile.ProfileName || profile.name;
            return rolesRequired.includes(roleName);
        });

        if (!hasPermissions) {
            console.warn(`Accès refusé. Rôles de l'utilisateur ne matchent pas avec: ${rolesRequired}`);
            return res.status(403).send("Accès refusé : Droits insuffisants");
        }

        next();
    };
};