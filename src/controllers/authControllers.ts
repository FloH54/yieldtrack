import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import bcrypt, {hash} from 'bcrypt';
import { Request, Response } from 'express';
import { User, Profiles} from "../models/Index";

const JWT_SECRET = 'ta_cle_secrete_tres_longue'; // TODO À mettre dans un fichier .env plus tard

// --- CONFIGURATION NODEMAILER ---
// À remplacer par vos identifiants SMTP (idéalement stockés dans un fichier .env)
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "VOTRE_USER_MAILTRAP",
        pass: "VOTRE_MDP_MAILTRAP"
    }
});

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password, rememberMe, next } = req.body;

        // Chercher l'utilisateur dans MariaDB via Sequelize
        const user = await User.findOne({
            where: { email },
            include: ['profiles']
        });

        // Si pas d'email associé, le notifié
        if (!user) {
            return res.render('login', { error: 'Unknow email.' });
        }

        // Vérifier le mot de passe
        if (!await bcrypt.compare(password, user.pwd)) {
            return res.render('login', { error: 'Password incorrect.' });
        };

        await user.update({ LastLoginAt: new Date() });

        // Génération du Token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            },
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

        const redirectPath = (next && next.startsWith('/')) ? next : '/';
        res.redirect(redirectPath);

        console.log('voici le token :',token);
    } catch (error) {
        console.error("Erreur lors du login:", error);
        res.status(500).send("Erreur serveur.");
    }
};

export const logout = async (req: Request, res: Response) => {
    res.clearCookie('token');
    res.redirect('/');
};

export const renderChangePassword = (req: Request, res: Response) => {
    // On passe null aux messages d'erreur et de succès pour le premier affichage
    res.render('Pages/change-password', {
        user: (req as any).user,
        error: null,
        success: null
    });
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = (req as any).user.id;

        // 1. Vérifier si les deux nouveaux mots de passe correspondent
        if (newPassword !== confirmPassword) {
            return res.render('Pages/change-password', {
                user: (req as any).user,
                error: "Les nouveaux mots de passe ne correspondent pas.",
                success: null
            });
        }

        const user = await User.findByPk(userId);
        if (!user) return res.redirect('/login');

        // 2. Vérifier si l'ancien mot de passe est correct
        const isValid = await bcrypt.compare(currentPassword, user.pwd);
        if (!isValid) {
            return res.render('Pages/change-password', {
                user: (req as any).user,
                error: "Le mot de passe actuel est incorrect.",
                success: null
            });
        }

        // 3. Hasher et sauvegarder le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await user.update({ pwd: hashedPassword });

        // 4. Afficher le message de succès
        res.render('Pages/change-password', {
            user: (req as any).user,
            error: null,
            success: "Votre mot de passe a été mis à jour avec succès."
        });
    } catch (error) {
        console.error("Erreur lors du changement de mot de passe:", error);
        res.render('Pages/change-password', {
            user: (req as any).user,
            error: "Une erreur serveur est survenue.",
            success: null
        });
    }
};

// --- 1. DEMANDE DE RÉINITIALISATION ---
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        // Sécurité : On affiche le même message que l'email existe ou non pour éviter le scan d'emails
        const successMessage = "Si cet email existe dans notre base, un lien de réinitialisation vous a été envoyé.";

        if (!user) {
            return res.render('login', { error: null, success: successMessage, next: '' });
        }

        // Création d'un token à usage unique valide 15 minutes
        const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });

        // Construction du lien
        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

        // Envoi de l'email
        await transporter.sendMail({
            from: '"Yieldtrack Support" <support@yieldtrack.io>',
            to: user.email,
            subject: "Réinitialisation de votre mot de passe",
            html: `
                <h3>Bonjour ${user.firstName},</h3>
                <p>Vous avez demandé à réinitialiser votre mot de passe sur Yieldtrack.</p>
                <p>Cliquez sur le lien ci-dessous (valide 15 minutes) :</p>
                <a href="${resetLink}" style="display:inline-block; padding:10px 20px; background-color:#4e73df; color:#fff; text-decoration:none; border-radius:5px;">Réinitialiser mon mot de passe</a>
                <p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.</p>
            `
        });

        res.render('login', { error: null, success: successMessage, next: '' });
    } catch (error) {
        console.error("Erreur forgotPassword:", error);
        res.render('login', { error: "Erreur lors de l'envoi de l'email.", success: null, next: '' });
    }
};

// --- 2. AFFICHAGE DE LA PAGE DE RÉINITIALISATION ---
export const renderResetPassword = async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        // Vérifie si le token est valide et n'a pas expiré
        jwt.verify(token as string, JWT_SECRET);
        res.render('reset-password', { token, error: null });
    } catch (error) {
        res.render('login', { error: 'Le lien de réinitialisation est invalide ou a expiré.', success: null, next: '' });
    }
};

// --- 3. TRAITEMENT DU NOUVEAU MOT DE PASSE ---
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        // Décoder le token pour retrouver l'ID de l'utilisateur
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.render('login', { error: 'Utilisateur introuvable.', success: null, next: '' });
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Mettre à jour la base de données
        await user.update({ pwd: hashedPassword });

        res.render('login', { error: null, success: 'Mot de passe mis à jour avec succès. Vous pouvez maintenant vous connecter.', next: '' });
    } catch (error) {
        res.render('login', { error: 'Erreur : le lien de réinitialisation est invalide ou a expiré.', success: null, next: '' });
    }
};