import { Request, Response, NextFunction } from 'express';

export const authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user; // Récupéré par isAuthenticated précédemment

        if (!user || !roles.includes(user.role)) {
            // L'utilisateur est connecté mais n'a pas le bon rôle
            return res.status(403).send("Accès refusé : Droits insuffisants");
        }
        next();
    };
};