import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    // Si pas de token alors login
    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, 'ta_cle_secrete_tres_longue');
        (req as any).user = decoded; // On stocke les infos de l'utilisateur dans la requête
        next();
    } catch (err) {
        // Si erreur il doit se reconnecter
        res.clearCookie('token');
        return res.redirect('/login');
    }
};