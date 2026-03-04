import { Router, Request, Response } from 'express';

const router = Router();

router.post('/columns', (req: Request, res: Response) => {
    const { tableId, columns, redirectUrl } = req.body;
    let colsArray: string[] = Array.isArray(columns) ? columns : (columns ? [columns] : []);

    const currentPrefs = (req as any).tablePreferences || {};
    currentPrefs[tableId] = colsArray;

    res.cookie('tablePreferences', JSON.stringify(currentPrefs), { maxAge: 30 * 24 * 60 * 60 * 1000 });

    // On redirige vers l'URL d'origine passée par le formulaire, ou l'accueil par défaut
    res.redirect(redirectUrl || '/');
});

export default router;