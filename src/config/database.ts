import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('yieldtrack','root','root',{
    host:'localhost',
    dialect:'mariadb',
    logging: false, // Pour enlever les messages dans la console
    dialectOptions: {
        timezone:'Etc/GMT-1',
    }
});
export default sequelize;