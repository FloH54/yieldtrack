import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User, Profiles } from "../models/Index";

export const USER_COLUMNS = [
    { id: 'id', label: "ID" },
    { id: 'firstName', label: "First Name" },
    { id: 'lastName', label: "Last Name" },
    { id: 'email', label: "Email" },
    { id: 'profiles', label: "Profiles" },
    { id: 'status', label: "Status" }
];

export const renderUsersPage = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const TABLE_ID = 'usersList';
    const selectedColumns = (req as any).tablePreferences[TABLE_ID] || ['firstName', 'lastName', 'email', 'profiles', 'status'];

    // On récupère les profils pour le menu déroulant multiple de la modale
    const allProfiles = await Profiles.findAll();

    res.render('Pages/users', {
        user,
        tableId: TABLE_ID,
        tableTitle: "Users Management",
        allColumns: USER_COLUMNS,
        selectedColumns,
        allProfiles,
        currentUrl: req.originalUrl,
        createAction: { label: "New User", icon: "fas fa-user-plus", modalTarget: "#createUserModal" }
    });
};

export const getUsersData = async (req: Request, res: Response) => {
    try {
        const users = await User.findAll({
            include: [{ model: Profiles, as: 'profiles' }]
        });
        res.json({ data: users });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password, profiles } = req.body;

        // Vérification si l'email existe déjà
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ error: "This email is already used." });

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 12);

        // Création de l'utilisateur
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            pwd: hashedPassword,
            IsActive: true
        });

        // Attribution des profils (profiles provient d'un select multiple, c'est donc un tableau d'IDs)
        if (profiles && profiles.length > 0) {
            await (newUser as any).setProfiles(profiles);
        }

        res.status(200).json({ redirect: '/users' });
    } catch (error) {
        console.error("Erreur création utilisateur :", error);
        res.status(500).json({ error: "Error while creating user" });
    }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const currentUser = (req as any).user; // L'utilisateur qui fait l'action

        // 1. Empêcher le "suicide" numérique
        if (id == currentUser.id) {
            return res.status(403).json({ error: "You cannot deactivate your own account." });
        }

        const targetUser = await User.findByPk(id);
        if (!targetUser) return res.status(404).json({ error: "User not found" });

        await targetUser.update({ IsActive: !targetUser.IsActive });
        res.status(200).json({ success: true, newStatus: targetUser.IsActive });
    } catch (error) {
        res.status(500).json({ error: "Error while updating user status" });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id, firstName, lastName, email, profiles } = req.body;

        const targetUser = await User.findByPk(id);
        if (!targetUser) return res.status(404).json({ error: "User not found" });

        // Vérification : si l'email change, s'assurer qu'il n'est pas déjà pris par un autre compte
        if (email !== targetUser.email) {
            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail) return res.status(400).json({ error: "This email is already used by another account." });
        }

        // Mise à jour des informations basiques
        await targetUser.update({
            firstName,
            lastName,
            email
        });

        // Mise à jour des profils (profiles est un tableau d'IDs issu du select multiple)
        if (profiles) {
            // Force en tableau au cas où un seul profil est sélectionné (ce qui envoie une string simple)
            const profileIds = Array.isArray(profiles) ? profiles : [profiles];
            await (targetUser as any).setProfiles(profileIds);
        } else {
            // Si l'admin a tout désélectionné, on vide les profils
            await (targetUser as any).setProfiles([]);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Erreur modification utilisateur :", error);
        res.status(500).json({ error: "Error while updating user" });
    }
};