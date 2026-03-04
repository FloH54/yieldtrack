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
    const nexUrl = req.query.next;
    res.render('login',{next: nexUrl});
});
app.post('/login', login);
app.get('/logout', logout);

// --- MIDDLEWARE D'AUTHENTIFICATION GLOBAL ---
app.use(isAuthenticated);

// --- ROUTES PROTÉGÉES ---
app.use('/project', projectRoutes); // Gère tout ce qui commence par /project
app.use('/remaining', taskRoutes); // Gére le reste à faire

app.get('/', (req: Request, res: Response) => {
    const user = (req as any).user;
    res.render('index', { user: user});
});
app.post('/create-wp', wpRoutes);
app.post('/preferences/columns', taskRoutes);

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