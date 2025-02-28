/* eslint-disable no-undef */
import dotenv from 'dotenv';
import db from '../config/db.js';
import { hashPassword } from '../middlewares/hashPassword.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

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
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
}

export async function loginUser(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Необходимо заполинть все поля' })
    }

    try {
        const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(400).json({ message: 'Пользователь не найден' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Неверный пароль' });
        }

        //Генерация JWT токена
        const token = jwt.sign({ id: user.id, nickname: user.nickname }, JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // если хочешь на HTTPS, ставь true
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
        });

        res.status(200).json({
            message: 'Авторизация успешна',
            token,
            nickname: user.nickname
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
}