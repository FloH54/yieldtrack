import express, { Request, Response } from 'express';
import { isAuthenticated } from "./middlewares/authMiddleware";
import path from 'path';
import sequelize from './config/database';
import cookieParser from 'cookie-parser';
import User from './models/User';
import { login } from "./controllers/authControllers";

const app = express();
const PORT = 3000;

// Configuration et Middlewares
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// Interface pour les menus
interface MenuItem {
    title: string;
    icon: string;
    link: string;
}

// Routes Publiques
app.get('/login', (req: Request, res: Response) => {
    res.render('login');
});

app.post('/login', login);

// Routes Protégées (On définit tout "à plat")
app.get('/', isAuthenticated, (req: Request, res: Response) => {

    // On rend la vue index et on passe les données
    res.render('index', {  });
});

app.get('/tasks', isAuthenticated, (req: Request, res: Response) => {
    res.render('tasks');
});

// 4. Lancement du serveur et de la base de données
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Connexion à MariaDB réussie.');

        await sequelize.sync({ alter: true });
        console.log('Base de données synchronisée.');

        app.listen(PORT, () => {
            console.log(`Yieldtrack lancé sur http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Impossible de se connecter à la base de données :', error);
    }
}

startServer();