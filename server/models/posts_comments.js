import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const PostComment = sequelize.define('PostComment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_post: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    coment: {
        type: DataTypes.STRING(1000),
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'posts_comments',
    timestamps: false,
});

export default PostComment;