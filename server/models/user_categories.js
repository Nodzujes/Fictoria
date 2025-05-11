import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const UserCategory = sequelize.define('UserCategory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
}, {
    tableName: 'user_categories',
    timestamps: false,
});

export default UserCategory;