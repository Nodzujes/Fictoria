import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import db from './config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const port = 5277;

const __dirname = path.resolve();

dotenv.config();

// Middleware для парсинга JSON
app.use(express.json());

// Подключаем маршруты аутентификации
app.use('/api/auth', authRoutes);

// Раздача файлов из билда
app.use(express.static(path.join(__dirname, 'dist')));

// Перенаправление всех маршрутов на index.html (для SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use(cors({
    origin: 'http://localhost:5173', // Адрес фронтенда
    credentials: true
}));

app.use(cookieParser());

db.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к БД:', err.stack);
        return;
    }
    console.log('Подключение к БД установлено');
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});