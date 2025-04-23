import dotenv from 'dotenv';
import db from '../config/db.js';
import { hashPassword } from '../middlewares/hashPassword.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

// Multer configuration for avatar upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads/avatars';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Исправлено: originalName -> originalname
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (!file || !file.originalname) {
            return cb(new Error('Файл не предоставлен или имеет неверный формат'));
        }
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // Исправлено: originalName -> originalname
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Только файлы JPG, PNG или GIF разрешены'));
    },
    limits: { fileSize: 1 * 1024 * 1024 } // 1MB limit
}).single('avatar');

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

export async function logoutUser(req, res) {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
        });
        res.status(200).json({ message: 'Выход выполнен успешно' });
    } catch (error) {
        console.error('Ошибка при выходе:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

export async function updateUserProfile(req, res) {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Не авторизован' });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const userId = decoded.id;
            const { name, status, categories } = req.body;

            // Получаем текущие данные пользователя
            const [user] = await db.promise().query('SELECT name, status, avatar_url FROM users WHERE id = ?', [userId]);
            if (user.length === 0) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            // Определяем значения для обновления
            const updatedName = name !== undefined ? (name.trim() === '' ? null : name) : user[0].name;
            const updatedStatus = status !== undefined ? (status.trim() === '' ? null : status) : user[0].status;
            let updatedAvatarUrl = user[0].avatar_url; // Сохраняем текущую аватарку по умолчанию

            // Если загружен новый файл аватарки
            if (req.file) {
                updatedAvatarUrl = `/uploads/avatars/${req.file.filename}`;
                // Удаляем старую аватарку, если она не дефолтная
                if (user[0].avatar_url !== '/public/images/userIcon.png' && fs.existsSync(path.join('public', user[0].avatar_url))) {
                    fs.unlinkSync(path.join('public', user[0].avatar_url));
                }
            }

            // Обновляем данные пользователя
            await db.promise().query(
                'UPDATE users SET name = ?, status = ?, avatar_url = ? WHERE id = ?',
                [updatedName, updatedStatus, updatedAvatarUrl, userId]
            );

            // Обновляем категории, если они были отправлены
            if (categories !== undefined) {
                const parsedCategories = categories ? JSON.parse(categories) : [];
                // Очищаем существующие категории
                await db.promise().query('DELETE FROM user_categories WHERE user_id = ?', [userId]);
                // Добавляем новые категории
                for (const category of parsedCategories) {
                    await db.promise().query(
                        'INSERT INTO user_categories (user_id, category) VALUES (?, ?)',
                        [userId, category]
                    );
                }
            }

            res.status(200).json({ message: 'Профиль обновлен', avatarUrl: updatedAvatarUrl });
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
            res.status(500).json({ message: 'Ошибка сервера', error: error.message });
        }
    });
}

export async function getUserProfile(req, res) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Не авторизован' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        
    // Получение аватара пользователя из БД
    const [user] = await db.promise().query(
        'SELECT email, nickname, name, status, avatar_url FROM users WHERE id = ?', [userId]
    );

    if (user.length === 0) {
        return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Получаем категории пользователя
    const [categories] = await db.promise().query(
        'SELECT category FROM user_categories WHERE user_id = ?',
        [userId]
    );

    const userData = {
        email: user[0].email,
        nickname: user[0].nickname,
        name: user[0].name || '',
        status: user[0].status || '',
        avatarUrl: user[0].avatar_url,
        categories: categories.map(c => c.category)
    };

    res.status(200).json(userData);

    } catch (error) {
        console.error('Ошибка при получении профиля:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}