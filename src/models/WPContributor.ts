import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class WPContributor extends Model {
    public wpId!: number;
    public userId!: number;
    public profileId!: number;
}

WPContributor.init(
    {
        wpId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, field: 'WPId' },
        userId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, field: 'UserId' },
        profileId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'ProfileId' }
    },
    { sequelize, tableName: 'WPContributors', timestamps: false }
);

export { WPContributor };