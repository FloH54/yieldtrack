import { Request, Response } from 'express';
import { Project, WorkPackage, Units, User, Profiles, Status, ProjectTypes, ProjectLeaders } from "../models/Index";
import { Op } from "sequelize";

// Aide pour vérifier les rôles plus facilement
const hasRole = (user: any, roles: string[]) => {
    if (!user || !user.profiles) return false;
    return user.profiles.some((profile: any) => {
        const roleName = profile.profileName || profile.ProfileName || profile.name;
        return roles.includes(roleName);
    });
};

export const PROJECT_COLUMNS = [
    { id: 'id', label: "ID" },
    { id: 'analyticalCode', label: "Analytical Code" },
    { id: 'name', label: "Project Name" },
    { id: 'type', label: "Type" },
    { id: 'leaders', label: "Program Leaders" },
    { id: 'slug', label: "Slug" },
    { id: 'start', label: "Start Date" },
    { id: 'end', label: "End Date" },
    { id: 'status', label: "Status" },
    { id: 'createdAt', label: "Created At" }
];

export const WP_COLUMNS = [
    { id: 'id', label: "ID" },
    { id: 'analyticalCode', label: "Analytical Code" },
    { id: 'name', label: "WP Name" },
    { id: 'parent', label: "Parent WP" },
    { id: 'account', label: "Account Number" },
    { id: 'slug', label: "Slug" },
    { id: 'status', label: "Status" }
];

export const renderProjectsPage = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const TABLE_ID = 'projectList';
        const selectedColumns = (req as any).tablePreferences[TABLE_ID] || ['name', 'type', 'start', 'end', 'status'];

        const isManagerOrAdmin = hasRole(user, ['Administrateur', 'Program Manager']);

        // Récupération des données pour les listes déroulantes de création/édition
        const allTypes = await ProjectTypes.findAll();
        const allStatus = await Status.findAll();

        // Récupérer uniquement les Program Leaders pour l'attribution
        const programLeaders = await User.findAll({
            include: [{
                model: Profiles,
                as: 'profiles',
                where: { ProfileName: 'Program Leader' }
            }]
        });

        // Seuls les Admins et Program Managers peuvent créer des projets
        const createBtn = isManagerOrAdmin
            ? { label: "New Project", icon: "fas fa-plus", modalTarget: "#projectModal" }
            : null;

        res.render('Pages/projects', {
            user, tableId: TABLE_ID, tableTitle: "Projects List",
            allColumns: PROJECT_COLUMNS, selectedColumns,
            currentUrl: req.originalUrl,
            allTypes,
            allStatus,
            programLeaders,
            createAction: createBtn
        });
    } catch (error) {
        console.error("Error rendering projects page:", error);
        res.status(500).send("Error rendering projects page.");
    }
};

export const getProjectsData = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const isManagerOrAdmin = hasRole(user, ['Administrateur', 'Program Manager']);

        let includeLeaders: any = {
            model: User,
            as: 'leaders',
            attributes: ['id', 'firstName', 'lastName'],
            through: { attributes: [] },
            required: false
        };

        if (!isManagerOrAdmin) {
            includeLeaders.required = true;
            includeLeaders.where = { id: user.id };
        }

        const projects = await Project.findAll({
            include: [
                { model: ProjectTypes, as: 'type' },
                { model: Status, as: 'status' },
                { model: User, as: 'creator', attributes: ['firstName', 'lastName'] },
                includeLeaders
            ]
        });

        // ==========================================
        // LA CORRECTION EST ICI : FORMATAGE DES DONNÉES
        // ==========================================
        const formattedData = projects.map((p: any) => {
            const plain = p.get({ plain: true }); // Convertit en objet pur
            return {
                id: plain.id,
                slug: plain.slug,
                createdAt: plain.createdAt,
                analyticalCode: plain.analyticalCode,
                name: plain.projectName,
                type: plain.type ? plain.type.projectTypeName : 'N/A',
                leaders: plain.leaders && plain.leaders.length > 0
                    ? plain.leaders.map((l: any) => `${l.firstName} ${l.lastName}`).join(', ')
                    : 'Aucun',
                start: plain.startDate ? plain.startDate.toString().split('T')[0] : 'N/A',
                end: plain.endDate ? plain.endDate.toString().split('T')[0] : 'N/A',

                // On extrait juste la chaîne de caractère pour le statut
                status: plain.status ? (plain.status.StatName || plain.status.statName) : 'N/A',

                // On garde les données brutes cachées pour que la modale d'édition fonctionne
                rawType: plain.type,
                rawStatus: plain.status,
                rawLeaders: plain.leaders,
                projectName: plain.projectName
            };
        });

        // On renvoie les données formatées, pas les données brutes
        res.json({ data: formattedData });
    } catch (error) {
        console.error("Erreur lors de la récupération des projets:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

export const renderProjectDetails = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { slug } = req.params;
        const TABLE_ID = 'wpList';
        const selectedColumns = (req as any).tablePreferences[TABLE_ID] || ['name', 'account', 'status'];

        const project = await Project.findOne({
            where: { slug },
            include: [{ model: User, as: 'leaders' }]
        });

        if (!project) return res.status(404).render('404', { user });

        const isManagerOrAdmin = hasRole(user, ['Administrateur', 'Program Manager']);
        const isAssignedLeader = (project as any).leaders.some((l: any) => l.id === user.id);

        if (!isManagerOrAdmin && !isAssignedLeader) {
            return res.status(403).send("Accès refusé : vous n'êtes pas assigné à ce projet.");
        }

        const projectWPs = await WorkPackage.findAll({ where: { projectId: (project as any).id } });

        // --- On récupère TOUS les types de projets (1=Corporate, 2=Template, 3=Production) ---
        const templateProjects = await Project.findAll({
            where: { projectTypeId: [1, 2, 3] },
            include: [{ model: WorkPackage, as: 'workPackages', where: { statId: 1 }, required: false }]
        });

        // Définition des boutons (Principal = Vide, Secondaire = Template)
        const createAction = { label: "Empty Wokrpackage", icon: "fas fa-plus", modalTarget: "#customWPModal" };
        const secondaryAction = { label: "Depuis un Template", icon: "fas fa-copy", modalTarget: "#createWpFromTemplateModal", btnClass: "btn-info" };

        res.render('Pages/projectsDetails', {
            user, project, tableId: TABLE_ID, tableTitle: "Work Packages",
            allColumns: WP_COLUMNS, selectedColumns,
            units: await Units.findAll(),
            projectWPs,
            templateProjects,
            currentUrl: req.originalUrl,
            createAction,      // On passe le bouton principal
            secondaryAction    // On passe le bouton pour la modale Template !
        });
    } catch (error) {
        console.error("Erreur details projet:", error);
        res.status(500).send("Server Error");
    }
};

export const getProjectWPsData = async (req: Request, res: Response) => {
    try {
        const project = await Project.findOne({
            where: { slug: req.params.slug },
            include: [{
                model: WorkPackage,
                as: 'workPackages',
                include: [
                    { model: WorkPackage, as: 'father' }, // Inclure le parent
                    { model: Status, as: 'status' }       // Inclure le statut
                ]
            }]
        });

        if (!project || !(project as any).workPackages) {
            return res.json({ data: [] });
        }

        // FORMATAGE DES DONNÉES DU WP POUR LE DATATABLE
        const formattedWPs = (project as any).workPackages.map((wp: any) => {
            const plainWp = wp.get({ plain: true });
            return {
                id: plainWp.id,
                slug: plainWp.slug,
                analyticalCode: (project as any).analyticalCode,
                projectSlug: (project as any).slug,
                name: plainWp.wpName,
                account: plainWp.accountNumber,
                parent: plainWp.father ? plainWp.father.wpName : 'Aucun',
                status: plainWp.status ? (plainWp.status.StatName || plainWp.status.statName) : 'N/A',

                // Données brutes pour la modale d'édition
                rawFatherId: plainWp.fatherWPId,
                rawStatus: plainWp.status
            };
        });

        res.json({ data: formattedWPs });
    } catch (error) {
        console.error("Erreur getProjectWPsData:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

const generateSlug = (text: string) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

export const createProject = async (req: Request, res: Response) => {
    try {
        const { projectName, analyticalCode, projectTypeId, startDate, endDate, leaderIds } = req.body;
        const currentUser = (req as any).user;

        const isManagerOrAdmin = hasRole(currentUser, ['Administrateur', 'Program Manager']);
        if (!isManagerOrAdmin) {
            return res.status(403).json({ error: "Action non autorisée." });
        }

        const codeRegex = /^[a-zA-Z0-9\-_]+$/;
        if (!analyticalCode || !codeRegex.test(analyticalCode) || analyticalCode.length > 50) {
            return res.status(400).json({ error: "Invalid Analytical Code. Use only alphanumeric characters, dashes, or underscores (max 50 chars)." });
        }

        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ error: "The end date cannot be earlier than the start date." });
        }

        const generatedSlug = generateSlug(projectName);
        const existingProject = await Project.findOne({ where: { slug: generatedSlug } });

        if (existingProject) {
            return res.status(400).json({ error: "This project name generates a slug that is already in use." });
        }

        const newProject = await Project.create({
            projectName,
            analyticalCode,
            slug: generatedSlug,
            projectTypeId,
            startDate: startDate || null,
            endDate: endDate || null,
            creatorUserId: currentUser.id,
            statId: 1 // Actif par défaut
        });

        // Assignation des Program Leaders via la table de liaison
        if (leaderIds && Array.isArray(leaderIds) && leaderIds.length > 0) {
            const plData = leaderIds.map((id: string) => ({ projectId: (newProject as any).id, userId: parseInt(id) }));
            await ProjectLeaders.bulkCreate(plData);
        }

        res.status(200).json({ redirect: '/project' });
    } catch (error) {
        console.error("Erreur Backend lors de la création du projet :", error);
        res.status(500).json({ error: "Error while creating the project. Check server console." });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        const { id, projectName, analyticalCode, projectTypeId, startDate, endDate, statId, leaderIds } = req.body;
        const currentUser = (req as any).user;

        const isManagerOrAdmin = hasRole(currentUser, ['Administrateur', 'Program Manager']);
        if (!isManagerOrAdmin) {
            return res.status(403).json({ error: "Seuls les Program Managers ou Administrateurs peuvent modifier un projet." });
        }

        const project = await Project.findByPk(id);
        if (!project) return res.status(404).json({ error: "Project not found." });

        // Mise à jour des informations de base du projet
        await project.update({
            projectName: projectName || (project as any).projectName,
            analyticalCode: analyticalCode || (project as any).analyticalCode,
            projectTypeId: projectTypeId || (project as any).projectTypeId,
            startDate: startDate || (project as any).startDate,
            endDate: endDate || (project as any).endDate,
            statId: statId || (project as any).statId
        });

        if (analyticalCode) {
            const codeRegex = /^[a-zA-Z0-9\-_]+$/;
            if (!codeRegex.test(analyticalCode) || analyticalCode.length > 50) {
                return res.status(400).json({ error: "Invalid Analytical Code. Use only alphanumeric characters, dashes, or underscores (max 50 chars)." });
            }
        }

        // Mise à jour des Leaders (on supprime les anciens et on insère les nouveaux)
        if (leaderIds && Array.isArray(leaderIds)) {
            await ProjectLeaders.destroy({ where: { projectId: (project as any).id } });
            if (leaderIds.length > 0) {
                const plData = leaderIds.map((userId: string) => ({ projectId: (project as any).id, userId: parseInt(userId) }));
                await ProjectLeaders.bulkCreate(plData);
            }
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Erreur update projet:", error);
        res.status(500).json({ error: "Error while updating the project." });
    }
};