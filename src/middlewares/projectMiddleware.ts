import { Request, Response, NextFunction } from 'express';

export const projectAccess = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user; // Récupéré par isAuthenticated précédemment

        const porjectMap : Map<string, string> = new Map(); // map avec le projet ou il a accès et avec quels roles



        next();
    };
};