import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import {User, Profiles, Units} from "../models/Index";
import {UserToUnits} from "../models/class/UserToUnits";

export const USER_COLUMNS = [
    { id: 'id', label: "ID" },
    { id: 'firstName', label: "First Name" },
    { id: 'lastName', label: "Last Name" },
    { id: 'email', label: "Email" },
    { id: 'profiles', label: "Profiles" },
    { id: 'units', label: "Units" },
    { id: 'status', label: "Status" },
    { id: 'createdAt', label: "Created At" },
    { id: 'lastLogin', label: "Last Login" }
];

export const renderUsersPage = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const TABLE_ID = 'usersList';
    const selectedColumns = (req as any).tablePreferences[TABLE_ID] || ['firstName', 'lastName', 'email', 'profiles', 'status'];

    const isAdmin = user.profiles.some((p: any) => ['Administrateur'].includes(p.profileName || p.ProfileName || p.name));

    let allProfiles = await Profiles.findAll();
    if (!isAdmin) {
        allProfiles = allProfiles.filter(p => p.id !== 1 && p.ProfileId !== 1);
    }
    const allUnits = await Units.findAll();

    // 1. Définition du 2ème bouton (uniquement pour les admins)
    let secondaryAction = null;
    if (isAdmin) {
        secondaryAction = {
            label: "New Unit",
            icon: "fas fa-plus",
            modalTarget: "#createUnitModal",
            btnClass: "btn-info" // Couleur bleu clair pour le différencier
        };
    }

    res.render('Pages/users', {
        user,
        tableId: TABLE_ID,
        tableTitle: "Users Management",
        allColumns: USER_COLUMNS,
        selectedColumns,
        allProfiles,
        allUnits,
        currentUrl: req.originalUrl,
        createAction: { label: "New User", icon: "fas fa-user-plus", modalTarget: "#createUserModal" },
        secondaryAction // 2. On passe la variable à la vue
    });
};

export const getUsersData = async (req: Request, res: Response) => {
    try {
        const users = await User.findAll({
            include: [
                { model: Profiles, as: 'profiles' },
                { model: Units }
            ]
        });
        res.json({ data: users });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password, profiles, units } = req.body;

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
        // Attribution des units (//)
        if (units && units.length > 0) {
            const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
            const unitAssignments = units.map((uId: string) => ({
                userId: newUser.id,
                unitId: parseInt(uId),
                startDate: today,
                weeklyHours: 0
            }));
            await UserToUnits.bulkCreate(unitAssignments);
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
        const { id, firstName, lastName, email, profiles, units } = req.body;

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

        await UserToUnits.destroy({ where: { userId: targetUser.id } }); // On supprime les anciennes
        if (units) {
            const unitIds = Array.isArray(units) ? units : [units];
            const today = new Date().toISOString().split('T')[0];
            const unitAssignments = unitIds.map((uId: string) => ({
                userId: targetUser.id,
                unitId: parseInt(uId),
                startDate: today,
                weeklyHours: 0
            }));
            await UserToUnits.bulkCreate(unitAssignments); // On insère les nouvelles
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Erreur modification utilisateur :", error);
        res.status(500).json({ error: "Error while updating user" });
    }
};

export const createUnit = async (req: Request, res: Response) => {
    try {
        const { unitName, fatherUnitId } = req.body;
        const user = (req as any).user;

        // Vérification stricte du rôle Administrateur
        const isAdmin = user.profiles.some((p: any) =>
            ['Administrateur'].includes(p.profileName || p.ProfileName || p.name)
        );

        if (!isAdmin) {
            return res.status(403).json({ error: "Only an Administrator can create a unit." });
        }

        await Units.create({
            unitName,
            fatherUnitId: fatherUnitId ? parseInt(fatherUnitId) : null
        });

        // Redirection vers la page users après création
        res.status(200).json({ success: true, redirect: '/users' });
    } catch (error) {
        console.error("Erreur création unité :", error);
        res.status(500).json({ error: "Error creating unit." });
    }
};