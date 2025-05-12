import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentsRoutes from './routes/commentsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import db from './config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { adminJs, adminRouter } from './config/admin.js';
import sequelize from './config/sequelize.js';
// eslint-disable-next-line no-unused-vars
import models from './models/index.js';

const app = express();
const port = 5277;

const __dirname = path.resolve();

dotenv.config();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/admin', adminRoutes);
app.use(adminJs.options.rootPath, adminRouter);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

db.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к БД:', err.stack);
        process.exit(1);
    }
    console.log('Подключение к БД установлено');
});

sequelize.authenticate()
    .then(() => console.log('Sequelize подключен к базе данных'))
    .catch(err => {
        console.error('Ошибка подключения Sequelize:', err);
        process.exit(1);
    });

sequelize.sync({ force: false })
    .then(() => console.log('Модели синхронизированы с базой данных'))
    .catch(err => console.error('Ошибка синхронизации моделей:', err));

app.listen(port, '0.0.0.0', () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});