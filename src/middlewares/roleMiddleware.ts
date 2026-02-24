import { Request, Response, NextFunction } from 'express';

export const authorize = (rolesRequired: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user; // Récupéré par isAuthenticated précédemment

        const hasPermissions : boolean = user.roles.some((role: string) => { rolesRequired.includes(role); });

        if (!user || !hasPermissions) {
            // L'utilisateur est connecté mais n'a pas le bon rôle
            return res.status(403).send("Accès refusé : Droits insuffisants");
        }
        next();
    };
};