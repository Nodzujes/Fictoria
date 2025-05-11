import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Like = sequelize.define('Like', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    post_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'likes',
    timestamps: false,
});

export default Like;