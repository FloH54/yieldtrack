import express, { Request, Response, NextFunction } from 'express';
import { isAuthenticated } from "./middlewares/authMiddleware";
import path from 'path';
import sequelize from './config/database';
import cookieParser from 'cookie-parser';
import { login, logout } from "./controllers/authControllers";
import {AVAILABLE_COLUMNS, generateResteAFaireView} from "./controllers/tasksController";
import {Project} from "./models/class/Project";
import {loadTablePreferences} from "./middlewares/preferencesMiddleware";

const app = express();
const PORT = 3000;

// --- CONFIGURATION & MIDDLEWARES DE BASE ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser());
app.use(loadTablePreferences);

// --- ROUTES PUBLIQUES ---
// (Accessibles sans être connecté)
app.get('/login', (req: Request, res: Response) => {
    res.render('login');
});
app.post('/login', login);
app.get('/logout', logout);

// --- MIDDLEWARE D'AUTHENTIFICATION GLOBAL ---
app.use(isAuthenticated);

// --- ROUTES PROTÉGÉES ---

app.get('/', (req: Request, res: Response) => {
    const user = (req as any).user;
    res.render('index', { user: user});
});

app.get('/remaining', async (req: Request, res: Response) => {
    const user = (req as any).user;

    // 1. On définit l'identifiant de CE tableau
    const TABLE_ID = 'remainingTasks';

    // 2. On lit le choix de l'utilisateur via le middleware, avec des colonnes par défaut s'il n'a rien choisi
    const selectedColumns = (req as any).tablePreferences[TABLE_ID] || ['id', 'project', 'taskName', 'status'];

    // 3. On génère la vue
    const tableData = await generateResteAFaireView(user.id, selectedColumns);

    res.render('Pages/remaining', {
        user: user,
        table: tableData,
        currentTableId: TABLE_ID,     // On passe l'ID du tableau au modal
        allColumns: AVAILABLE_COLUMNS,
        selectedColumns: selectedColumns
    });
});

// --- ROUTES PROJET DYNAMIQUE ---
app.get('/projet/:slug', async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const projectSlug = req.params.slug;

        // Recherche du projet via son Slug !
        const project = await Project.findOne({
            where: { slug: projectSlug },
            include: ['workPackages'] // On charge les lots en même temps
        });

        if (!project) {
            return res.status(404).render('404', { url: req.originalUrl });
        }

        res.render('projetDetails', { user, project });
    } catch (error) {
        res.status(500).send("Erreur serveur");
    }
});

// --- ROUTES POUR GÉRER LES PRÉFÉRENCES ---
app.post('/preferences/columns', (req: Request, res: Response) => {
    const { tableId, columns } = req.body;
    let colsArray: string[] = [];

    // Gestion robuste : si aucune case n'est cochée, 'columns' est undefined
    if (columns === undefined) {
        colsArray = [];
    } else if (typeof columns === 'string') {
        colsArray = [columns];
    } else if (Array.isArray(columns)) {
        colsArray = columns;
    }

    const currentPrefs = (req as any).tablePreferences || {};
    currentPrefs[tableId] = colsArray;

    // Sauvegarde dans le cookie
    res.cookie('tablePreferences', JSON.stringify(currentPrefs), { maxAge: 30 * 24 * 60 * 60 * 1000 });

    if (tableId === 'remainingTasks') {
        return res.redirect('/remaining');
    }

    // Redirection de secours si on ne reconnaît pas la table
    res.redirect('/');
});

// --- GESTION DE L'ERREUR 404 ---
app.use((req: Request, res: Response) => {
    res.status(404).render('404', {
        url: req.originalUrl,
        user: (req as any).user || null
    });
});

// --- LANCEMENT ---
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Connexion à MariaDB réussie.');
        await sequelize.sync();
        app.listen(PORT, () => {
            console.log(`Yieldtrack lancé sur http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Erreur de connexion :', error);
    }
}

startServer();