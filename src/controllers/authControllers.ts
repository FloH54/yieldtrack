import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import User from '../models/User';

const JWT_SECRET = 'ta_cle_secrete_tres_longue'; // TODO À mettre dans un fichier .env plus tard

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password, rememberMe } = req.body;

        // Chercher l'utilisateur dans MariaDB via Sequelize
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // Si pas d'email associé, le notifié
            return res.status(401).send("Utilisateur non trouvé.");
        }

        // Vérifier le mot de passe
        if (!await bcrypt.compare(password, user.password)) {
            return res.status(401).send("Mot de passe incorrect.");
        };

        // tout est bon, redirection vers le Dashboard
        console.log(`Connexion réussie pour : ${email}`);

        // Génération du Token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: rememberMe ? '7d' : '2h' } // 7 jours si coché, sinon 2h
        );

        // Envoi du cookie
        res.cookie('token', token, {
            httpOnly: true,    // Empêche le vol de token via JavaScript (XSS)
            secure: false,      // TODO Mettre à true en production (HTTPS)
            maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000, // Ms
            sameSite: 'strict'
        });

        res.redirect('/');

    } catch (error) {
        console.error("Erreur lors du login:", error);
        res.status(500).send("Erreur serveur.");
    }
};

export const logout = async (req: Request, res: Response) => {
    res.clearCookie('token');
    res.redirect('/');
};