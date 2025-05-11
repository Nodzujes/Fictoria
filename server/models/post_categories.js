import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const PostCategory = sequelize.define('PostCategory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'post_categories',
    timestamps: false,
});

export default PostCategory;