import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const PostBlock = sequelize.define('PostBlock', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('text', 'images', 'videos'),
        allowNull: false,
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    media_urls: {
        type: DataTypes.JSON,
        allowNull: true,
    },
}, {
    tableName: 'post_blocks',
    timestamps: false,
});

export default PostBlock;