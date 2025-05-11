import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSSequelize from '@adminjs/sequelize';
import models from '../models/index.js';
import jwt from 'jsonwebtoken';
import express from 'express';

AdminJS.registerAdapter(AdminJSSequelize);

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

const adminJs = new AdminJS({
    databases: [],
    resources: [
        {
            resource: models.User,
            options: {
                properties: {
                    password: { isVisible: { show: false, edit: false, list: false, filter: false } },
                    avatar_url: { isVisible: { show: true, edit: true, list: true, filter: true } },
                    is_admin: { isVisible: { show: true, edit: true, list: true, filter: true } },
                },
            },
        },
        { resource: models.Post },
        { resource: models.Category },
        { resource: models.Like },
        { resource: models.PostComment },
        { resource: models.PostBlock },
        { resource: models.PostCategory },
        { resource: models.UserCategory },
        { resource: models.VerificationCode },
    ],
    rootPath: '/admin',
    branding: {
        companyName: 'Fictoria Admin',
        logo: false,
        softwareBrothers: false,
    },
});

const router = express.Router();

router.use(async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await models.User.findOne({ where: { id: decoded.id } });

        if (!user || !user.is_admin) {
            return res.redirect('/');
        }

        req.adminUser = { id: user.id, email: user.email, nickname: user.nickname };
        next();
    } catch (error) {
        console.error('Ошибка аутентификации AdminJS:', error);
        return res.redirect('/login');
    }
});

const adminRouter = AdminJSExpress.buildRouter(adminJs, router);

export { adminJs, adminRouter };