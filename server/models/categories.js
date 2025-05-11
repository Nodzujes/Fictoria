import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
}, {
    tableName: 'categories',
    timestamps: false,
});

export default Category;