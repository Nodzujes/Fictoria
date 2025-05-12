import express from 'express';
import { Sequelize } from 'sequelize';
import models from '../models/index.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

// Middleware для проверки админ-доступа
const authenticateAdmin = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: 'Токен отсутствует' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await models.User.findOne({ where: { id: decoded.id } });

        if (!user || !user.is_admin) {
            return res.status(403).json({ error: 'Доступ запрещён' });
        }

        req.adminUser = user;
        next();
    } catch (error) {
        console.error('Ошибка аутентификации:', error);
        return res.status(401).json({ error: 'Неверный токен' });
    }
};

// Получение данных о регистрациях пользователей за месяц
router.get('/users-by-month', authenticateAdmin, async (req, res) => {
    try {
        const users = await models.User.findAll({
            attributes: [
                [Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m-%d'), 'date'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
            ],
            where: {
                created_at: {
                    [Sequelize.Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 1)),
                },
            },
            group: [Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m-%d')],
            order: [[Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m-%d'), 'ASC']],
        });

        res.json(users.map(user => ({
            date: user.get('date'),
            count: parseInt(user.get('count')),
        })));
    } catch (error) {
        console.error('Ошибка получения данных пользователей:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение данных о лайках за месяц
router.get('/likes-by-month', authenticateAdmin, async (req, res) => {
    try {
        const likes = await models.Like.findAll({
            attributes: [
                [Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m-%d'), 'date'],
                [Sequelize.fn('COUNT', Sequelize.col('post_id')), 'count'],
            ],
            where: {
                created_at: {
                    [Sequelize.Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 1)),
                },
            },
            group: [Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m-%d')],
            order: [[Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m-%d'), 'ASC']],
        });

        res.json(likes.map(like => ({
            date: like.get('date'),
            count: parseInt(like.get('count')),
        })));
    } catch (error) {
        console.error('Ошибка получения данных лайков:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение данных о постах за месяц
router.get('/posts-by-month', authenticateAdmin, async (req, res) => {
    try {
        const posts = await models.Post.findAll({
            attributes: [
                [Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m-%d'), 'date'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
            ],
            where: {
                created_at: {
                    [Sequelize.Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 1)),
                },
            },
            group: [Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m-%d')],
            order: [[Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m-%d'), 'ASC']],
        });

        res.json(posts.map(post => ({
            date: post.get('date'),
            count: parseInt(post.get('count')),
        })));
    } catch (error) {
        console.error('Ошибка получения данных постов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

export default router;