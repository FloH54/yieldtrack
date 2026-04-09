import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// CORRECTION : On importe User depuis l'Index des modèles, pas depuis la classe
import { User } from "../models/Index";

const JWT_SECRET = process.env.JWT_SECRET;

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    // Si pas de token alors login
    if (!token) {
        return res.redirect('/login?next=' + req.originalUrl);
    }

    try {
        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET n'est pas défini");
        }

        // verif de la signature du token
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        // récupération des données utilisateur avec l'association 'profiles'
        const user = await User.findByPk(decoded.id, {
            include: ['profiles'],
        });

        // verif si l'utilisateur existe et s'il est actif
        // (Attention à la casse de IsActive, vérifie que c'est bien écrit comme ça dans ton modèle)
        if (!user || !user.IsActive) {
            console.log("Utilisateur introuvable ou inactif :", user ? "Inactif" : "Introuvable");
            res.clearCookie('token');
            return res.redirect('/login');
        }

        // Attache l'utilisateur à la requête
        (req as any).user = user.get({ plain: true });

        next();

    } catch (err) {
        // Afficher l'erreur dans la console pour savoir EXACTEMENT ce qui plante
        console.error("Erreur dans authMiddleware :", err);

        // Si erreur il doit se reconnecter
        res.clearCookie('token');
        return res.redirect('/login');
    }
};