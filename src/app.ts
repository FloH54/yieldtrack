import express, { Request, Response, NextFunction } from 'express';
import { isAuthenticated } from "./middlewares/authMiddleware";
import path from 'path';
import sequelize from './config/database';
import cookieParser from 'cookie-parser';
import { login, logout } from "./controllers/authControllers";
import {loadTablePreferences} from "./middlewares/preferencesMiddleware";
import projectRoutes from "./rootes/projectRoutes";
import taskRoutes from "./rootes/taskRoutes";
import wpRoutes from "./rootes/wpRoutes";
import preferenceRoutes from "./rootes/preferenceRoutes";
import {renderUnitTasksPage, getUnitTasks, updateAsigneeUser} from "./controllers/unitsController";

const app = express();
const PORT = 3000;

// --- CONFIGURATION & MIDDLEWARES DE BASE ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Un seul suffit
app.use(express.static(path.join(__dirname, '../public')));
app.use(loadTablePreferences);

// --- ROUTES PUBLIQUES ---
app.get('/login', (req, res) => {
    res.render('login', { next: req.query.next });
});
app.post('/login', login);
app.get('/logout', logout);


// --- MIDDLEWARE D'AUTHENTIFICATION GLOBAL ---
app.use(isAuthenticated);

// --- ROUTES PROTÉGÉES (Groupées par entité) ---
app.use('/project', projectRoutes);     // Tout ce qui touche aux projets
app.use('/wp', wpRoutes);               // Tout ce qui touche aux Work Packages
app.use('/task', taskRoutes);           // Tout ce qui touche aux tâches
app.use('/remaining', taskRoutes);      // On garde l'accès pour la page "Reste à faire"
app.use('/preferences', preferenceRoutes); // Un unique point d'entrée pour les colonnes
app.get('/allocation', renderUnitTasksPage); // Rendu de la page HTML
app.get('/units/api/data', getUnitTasks);
app.post('/units/update-assignee', updateAsigneeUser)

app.get('/', (req, res) => res.render('index', { user: (req as any).user }));

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