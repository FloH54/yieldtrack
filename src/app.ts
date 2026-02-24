import express, { Request, Response, NextFunction } from 'express';
import { isAuthenticated } from "./middlewares/authMiddleware";
import path from 'path';
import sequelize from './config/database';
import cookieParser from 'cookie-parser';
import { login, logout } from "./controllers/authControllers";
import { generateResteAFaireView } from "./controllers/tasksController";

const app = express();
const PORT = 3000;

// --- CONFIGURATION & MIDDLEWARES DE BASE ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

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
    const tableData = await generateResteAFaireView(user.id);
    res.render('Pages/remaining', { user: user, table: tableData });
});

// --- GESTION DE L'ERREUR 404 ---
app.use((req: Request, res: Response) => {
    res.status(404).render('404', { url: req.originalUrl });
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