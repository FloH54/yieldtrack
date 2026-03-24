import { Request, Response } from 'express';
import {Project, WorkPackage, Units, WPContributor, User, Profiles, Status} from "../models/Index";
import {WPTypes} from "../models/class/WPTypes";
import {Op} from "sequelize";

export const PROJECT_COLUMNS = [
    { id: 'id', label: "ID" },
    { id: 'name', label: "Project Name" },
    { id: 'manager', label: "Manager" },
    { id: 'slug', label: "Slug" },
    { id: 'start', label: "Start Date" },
    { id: 'end', label: "End Date" },
    { id: 'status', label: "Status" },
    { id: 'createdAt', label: "Created At" }
];

export const WP_COLUMNS = [
    { id: 'id', label: "ID" },
    { id: 'name', label: "WP Name" },
    { id: 'type', label: "Type" },
    { id: 'parent', label: "Parent WP" },
    { id: 'account', label: "Account Number" },
    { id: 'slug', label: "Slug" },
    { id: 'status', label: "Status" }
];

export const renderProjectsPage = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const TABLE_ID = 'projectList';
        const selectedColumns = (req as any).tablePreferences[TABLE_ID] || ['name', 'start', 'end', 'status']; // Ajout du statut par défaut

        // Récupérer uniquement les Chefs de projet (Program Manager) pour la liste déroulante
        const managers = await User.findAll({
            include: [{
                model: Profiles,
                as: 'profiles',
                where: { ProfileName: 'Program Manager' } // Adaptez si la casse est différente dans votre BDD
            }]
        });

        // Récupérer les statuts pour la clôture
        const allStatus = await Status.findAll();

        const isGlobalViewer = user.profiles && user.profiles.some((profile: any) => {
            const roleName = profile.profileName || profile.ProfileName || profile.name;
            return ['Administrateur', 'Direction Générale'].includes(roleName);
        });

// S'il n'est pas Admin/Directeur, on ne lui passe pas l'action de création de projet
        const createBtn = isGlobalViewer
            ? { label: "New Project", icon: "fas fa-plus", modalTarget: "#projectModal" }
            : null;


        res.render('Pages/projects', {
            user, tableId: TABLE_ID, tableTitle: "Projects List",
            allColumns: PROJECT_COLUMNS, selectedColumns,
            currentUrl: req.originalUrl,
            managers, // On envoie les managers à la vue
            allStatus, // On envoie les statuts
            createAction: createBtn
        });
    } catch (error) {
        res.status(500).send("Error rendering projects page.");
    }
};

export const getProjectsData = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        // 1. On vérifie si l'utilisateur a un rôle "Global" (Admin ou Directeur)
        const isGlobalViewer = user.profiles && user.profiles.some((profile: any) => {
            const roleName = profile.profileName || profile.ProfileName || profile.name;
            return ['Administrateur', 'Direction Générale'].includes(roleName);
        });

        if (isGlobalViewer) {
            // S'il est Admin ou Directeur, on renvoie absolument TOUS les projets
            const allProjects = await Project.findAll();
            return res.json({ data: allProjects });
        }

        // 2. Sinon (ex: Program Manager), on applique le filtre de visibilité
        const userProjects = await Project.findAll({
            include: [{
                model: User,
                as: 'creator',
                attributes: ['firstName', 'lastName'],
            },
                {
                model: WorkPackage,
                as: 'workPackages',
                required: false,
                include: [{
                    model: WPContributor,
                    as: 'contributors', // Vérifiez que cet alias correspond bien à votre Index.ts
                    where: { userId: user.id },
                    required: false
                },
                    ]
            }],
            where: {
                [Op.or]: [
                    { creatorUserId: user.id },
                    { '$workPackages.contributors.userId$': user.id }
                ]
            }
        });

        res.json({ data: userProjects });
    } catch (error) {
        console.error("Erreur lors de la récupération des projets:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

export const renderProjectDetails = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { slug } = req.params;
    const TABLE_ID = 'wpList';
    const selectedColumns = (req as any).tablePreferences[TABLE_ID] || ['name', 'type', 'account'];

    const project = await Project.findOne({ where: { slug } });
    if (!project) return res.status(404).render('404');

    // On récupère les données pour les listes déroulantes de la modale d'édition
    const allWPTypes = await WPTypes.findAll();
    const projectWPs = await WorkPackage.findAll({ where: { projectId: project.id } });

    res.render('Pages/projectsDetails', {
        user, project, tableId: TABLE_ID, tableTitle: "Work Packages",
        allColumns: WP_COLUMNS, selectedColumns,
        units: await Units.findAll(),
        allWPTypes, projectWPs, // Envoyés à la vue
        currentUrl: req.originalUrl,
        createAction: { label: "New Work Package", icon: "fas fa-plus", modalTarget: "#customWPModal" }
    });
};

export const getProjectWPsData = async (req: Request, res: Response) => {
    try {
        const project = await Project.findOne({
            where: { slug: req.params.slug },
            include: [{
                model: WorkPackage,
                as: 'workPackages',
                include: [
                    { model: WPTypes, as: 'type' },    // Inclure le nom du type
                    { model: WorkPackage, as: 'father' } // Inclure le parent
                ]
            }]
        });
        res.json({ data: (project as any)?.workPackages || [] });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};

const generateSlug = (text: string) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Remplace les espaces par des tirets
        .replace(/[^\w\-]+/g, '')       // Supprime les caractères spéciaux
        .replace(/\-\-+/g, '-')         // Évite les doubles tirets
        .replace(/^-+/, '')             // Trim début
        .replace(/-+$/, '');            // Trim fin
};

export const createProject = async (req: Request, res: Response) => {
    try {
        const { projectName, startDate, endDate, managerId } = req.body;
        const currentUser = (req as any).user; // On récupère l'utilisateur qui fait l'action

        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ error: "The end date cannot be earlier than the start date." });
        }

        const generatedSlug = generateSlug(projectName);
        const existingProject = await Project.findOne({ where: { slug: generatedSlug } });

        if (existingProject) {
            return res.status(400).json({ error: "This project name generates a slug that is already in use." });
        }

        // CORRECTION MAJEURE ICI :
        // Si managerId est vide (""), on assigne le projet au Directeur (currentUser.id)
        // Sinon, on le convertit proprement en nombre entier (parseInt)
        const finalManagerId = managerId ? parseInt(managerId) : currentUser.id;

        await Project.create({
            projectName,
            slug: generatedSlug,
            startDate: startDate || null,
            endDate: endDate || null,
            creatorUserId: finalManagerId,
            statId: 1 // Actif par défaut à la création
        });

        res.status(200).json({ redirect: '/project' });
    } catch (error) {
        // NOUVEAU LOG : Pour voir exactement pourquoi MariaDB refuse l'insertion
        console.error("🔴 Erreur Backend lors de la création du projet :", error);
        res.status(500).json({ error: "Error while creating the project. Check server console." });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        const { id, projectName, startDate, endDate, managerId, statId } = req.body;
        const currentUser = (req as any).user;

        const isDirector = currentUser.profiles.some((p: any) =>
            ['Direction Générale', 'Administrateur'].includes(p.profileName || p.ProfileName)
        );

        const project = await Project.findByPk(id);
        if (!project) return res.status(404).json({ error: "Project not found." });

        // Si l'utilisateur essaie de clôturer le projet (statId = 4) mais n'est pas directeur
        if (statId && parseInt(statId) === 4 && !isDirector) {
            return res.status(403).json({ error: "Seul la Direction Générale peut clôturer un projet." });
        }

        await project.update({
            projectName,
            startDate: startDate || null,
            endDate: endDate || null,
            creatorUserId: isDirector && managerId ? managerId : project.creatorUserId, // Seul le dir/admin peut changer le manager
            statId: statId || project.statId
        });

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Error while updating the project." });
    }
};