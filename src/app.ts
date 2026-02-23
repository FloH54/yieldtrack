import express, { Request, Response } from 'express';
import { isAuthenticated } from "./middlewares/authMiddleware";
import path from 'path';
import sequelize from './config/database';
import cookieParser from 'cookie-parser';
import { login, logout } from "./controllers/authControllers";
import ResteAFaire from "./models/tables/ResteAFaire";
import resteAFaire from "./models/tables/ResteAFaire";
import {generateResteAFaireView} from "./controllers/tasksController";

const app = express();
const PORT = 3000;

// Configuration et Middlewares
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));


// Routes Publiques
app.get('/login', (req: Request, res: Response) => {
    res.render('login');
});

app.post('/login', login);
app.get('/logout', logout);

// Routes Protégées (On définit tout "à plat")
app.get('/', isAuthenticated, async (req: Request, res: Response) => {
    // On récupère le users dans le middleware
    const user = (req as any).user;
    // On récupère les tâches (await pour attendre la rep de la bd)
    const tableData = await generateResteAFaireView(user.id);

    // On rend la vue index et on passe les données avec les noms user et table
    res.render('index', { user: user, table: tableData });
});

app.get('/tasks', isAuthenticated, (req: Request, res: Response) => {
    res.render('tasks');
});

// 4. Lancement du serveur et de la base de données
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Connexion à MariaDB réussie.');

        await sequelize.sync();
        console.log('Base de données synchronisée.');

        app.listen(PORT, () => {
            console.log(`Yieldtrack lancé sur http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Impossible de se connecter à la base de données :', error);
    }
}

startServer();