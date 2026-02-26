import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from "../models/class/User";

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    // Si pas de token alors login
    if (!token) {
        return res.redirect('/login');
    }

    try {
        // verif de la signature du token
        const decoded = jwt.verify(token, 'ta_cle_secrete_tres_longue') as any;

        // récupération des données utilisateur
        const user = await User.findByPk(decoded.id,{
            include: ['profiles'],
        })

        // verif si l'utilisateur est actif
        if(!user || !user.IsActive){
            res.clearCookie('token');
            return res.redirect('/login');
        }
        // Attache l'utilisateur à la requête
        (req as any ).user = user.get({plain: true})

        next();

    } catch (err) {
        // Si erreur il doit se reconnecter
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

