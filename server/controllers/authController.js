import dotenv from 'dotenv';
import db from '../config/db.js';
import { hashPassword } from '../middlewares/hashPassword.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

export async function regUser(req, res) {
    const { email, nickname, password } = req.body;

    if (!email || !nickname || !password) {
        return res.status(400).json({ message: 'Заполните все поля' });
    }

    try {
        const [existingUser] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Пользователь уже существует' });
        }

        const hashedPassword = await hashPassword(password);

        await db.promise().query(
            'INSERT INTO users (email, nickname, password) VALUES (?, ?, ?)',
            [email, nickname, hashedPassword]
        );

        res.status(201).json({ message: 'Пользователь зарегистрирован' });
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

export async function loginUser(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Необходимо заполнить все поля' });
    }

    try {
        console.log('Попытка входа для:', email);
        const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(400).json({ message: 'Пользователь не найден' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Неверный пароль' });
        }

        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET не определен');
        }

        const token = jwt.sign({ id: user.id, nickname: user.nickname }, JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: 'Авторизация успешна',
            token,
            nickname: user.nickname
        });
    } catch (error) {
        console.error('Ошибка при входе:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

export async function checkAuth(req, res) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ isAuthenticated: false });
    }

    try {
        console.log('Проверка токена:', token);
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET не определен');
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        res.status(200).json({
            isAuthenticated: true,
            nickname: decoded.nickname
        });
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        res.status(401).json({ isAuthenticated: false, error: error.message });
    }
}

// Новая функция для выхода
export async function logoutUser(req, res) {
    try {
        // Очищаем cookie с токеном
        res.clearCookie('token', {
            httpOnly: true,
            secure: false, // Должно совпадать с настройками при установке
        });
        res.status(200).json({ message: 'Выход выполнен успешно' });
    } catch (error) {
        console.error('Ошибка при выходе:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}