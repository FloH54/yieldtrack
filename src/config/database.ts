import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('yieldtrack','root','root',{
    host:'localhost',
    dialect:'mariadb',
    dialectOptions: {
        timezone:'Etc/GMT-1',
    }
});
export default sequelize;