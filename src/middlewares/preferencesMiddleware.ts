import { Request, Response, NextFunction } from 'express';

export const loadTablePreferences = (req: Request, res: Response, next: NextFunction) => {
    let prefs = {};

    // Si le cookie existe, on essaie de le lire
    if (req.cookies.tablePreferences) {
        try {
            prefs = JSON.parse(req.cookies.tablePreferences);
        } catch (e) {
            prefs = {}; // En cas de cookie corrompu, on repart à zéro
        }
    }

    // On attache les préférences à la requête
    (req as any).tablePreferences = prefs;

    // On attache aussi à "locals" (pour y accéder directement dans n'importe quel fichier EJS)
    res.locals.tablePreferences = prefs;
    res.locals.currentUrl = req.originalUrl;

    next();
};