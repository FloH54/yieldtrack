import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Charge les variables du fichier .env
dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'yieldtrack',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        dialect: 'mariadb',
        logging: false, // Mettez à 'console.log' pour voir les requêtes SQL
    }
);

export default sequelize;