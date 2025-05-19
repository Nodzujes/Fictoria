import dotenv from 'dotenv';
import db from '../config/db.js';
import { hashPassword } from '../middlewares/hashPassword.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import fetch from 'node-fetch';
import sanitizeHtml from 'sanitize-html';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const RECAPTCHA_SECRET_KEY = '6LeMTdsqAAAAAKrClj9hNFygUyDFKYkEvud0sRrJ';

// Валидация email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sanitizeString = (input) => {
    return sanitizeHtml(input, {
        allowedTags: [], // Запрещаем все HTML-теги
        allowedAttributes: {}, // Запрещаем все атрибуты
    }).replace(/[<>"'`;]/g, '');
};

// Функция для проверки reCAPTCHA токена
const verifyRecaptcha = async (token) => {
    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`
    });

    const data = await response.json();
    return data.success;
};

export async function regUser(req, res) {
    const { email, nickname, password } = req.body;

    if (!email || !nickname || !password) {
        return res.status(400).json({ message: 'Заполните все поля' });
    }

    // Валидация входных данных
    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Неверный формат email' });
    }
    if (nickname.length > 50 || nickname.length < 3) {
        return res.status(400).json({ message: 'Никнейм должен быть от 3 до 50 символов' });
    }
    if (password.length < 6 || password.length > 100) {
        return res.status(400).json({ message: 'Пароль должен быть от 6 до 100 символов' });
    }

    const sanitizedNickname = sanitizeString(nickname);

    try {
        console.log('Попытка регистрации пользователя:', { email, nickname: sanitizedNickname });

        // Проверка существующего пользователя по email
        const [existingUserByEmail] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUserByEmail.length > 0) {
            console.log('Пользователь уже существует:', email);
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        // Проверка существующего пользователя по никнейму
        const [existingUserByNickname] = await db.promise().query('SELECT * FROM users WHERE nickname = ?', [sanitizedNickname]);
        if (existingUserByNickname.length > 0) {
            console.log('Никнейм уже занят:', sanitizedNickname);
            return res.status(400).json({ message: 'Этот никнейм уже занят' });
        }

        const hashedPassword = await hashPassword(password);
        const verificationCode = generateVerificationCode();
        console.log('Сгенерирован код верификации:', verificationCode);

        // Создание пользователя
        const [result] = await db.promise().query(
            'INSERT INTO users (email, nickname, password) VALUES (?, ?, ?)',
            [email, sanitizedNickname, hashedPassword]
        );
        console.log('Пользователь создан, ID:', result.insertId);

        const userId = result.insertId;
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 минут

        // Сохранение кода верификации
        await db.promise().query(
            'INSERT INTO verification_codes (user_id, code, expires_at) VALUES (?, ?, ?)',
            [userId, verificationCode, expiresAt]
        );
        console.log('Код верификации сохранен в базе данных для userId:', userId);

        // Проверка конфигурации email
        console.log('Конфигурация email:', {
            from: process.env.EMAIL_USER,
            to: email,
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT
        });

        // Отправка email с кодом
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Код подтверждения для Fictoria',
                text: `Ваш код подтверждения: ${verificationCode}\nКод действителен 15 минут.`
            });
            console.log('Email с кодом верификации успешно отправлен на:', email);
        } catch (emailError) {
            console.error('Ошибка при отправке email для верификации:', emailError);
            return res.status(500).json({ message: 'Не удалось отправить email с кодом подтверждения', error: emailError.message });
        }

        res.status(201).json({ message: 'Пользователь зарегистрирован, проверьте email для подтверждения' });
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

export async function verifyUser(req, res) {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ message: 'Необходимо указать email и код' });
    }

    try {
        const [users] = await db.promise().query('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const userId = users[0].id;
        const [codes] = await db.promise().query(
            'SELECT * FROM verification_codes WHERE user_id = ? AND code = ?',
            [userId, code]
        );

        if (codes.length === 0) {
            return res.status(400).json({ message: 'Неверный код подтверждения' });
        }

        const verification = codes[0];
        if (new Date(verification.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Код подтверждения истек' });
        }

        await db.promise().query(
            'UPDATE users SET is_verified = 1 WHERE id = ?',
            [userId]
        );

        await db.promise().query(
            'DELETE FROM verification_codes WHERE user_id = ?',
            [userId]
        );

        res.status(200).json({ message: 'Аккаунт успешно подтвержден' });
    } catch (error) {
        console.error('Ошибка при верификации:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

export async function loginUser(req, res) {
    const { email, password, recaptchaToken } = req.body;

    if (!email || !password || !recaptchaToken) {
        return res.status(400).json({ message: 'Необходимо заполнить все поля и пройти капчу' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Неверный формат email' });
    }
    if (password.length < 6 || password.length > 100) {
        return res.status(400).json({ message: 'Пароль должен быть от 6 до 100 символов' });
    }

    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
        return res.status(400).json({ message: 'Ошибка проверки капчи. Подтвердите, что вы не робот' });
    }

    try {
        console.log('Попытка входа для:', email);
        const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(400).json({ message: 'Пользователь не найден' });
        }

        const user = users[0];
        console.log('User fetched:', { id: user.id, email: user.email, is_admin: user.is_admin, is_2fa_enabled: user.is_2fa_enabled });

        if (!user.is_verified) {
            return res.status(403).json({ message: 'Подтвердите email перед входом' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Неверный пароль' });
        }

        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET не определен');
        }

        // Проверяем, включена ли 2FA и не является ли пользователь админом
        if (user.is_2fa_enabled && !user.is_admin) {
            const verificationCode = generateVerificationCode();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 минут

            // Удаляем старые коды 2FA
            await db.promise().query('DELETE FROM verification_codes WHERE user_id = ?', [user.id]);

            // Сохраняем новый код 2FA
            await db.promise().query(
                'INSERT INTO verification_codes (user_id, code, expires_at) VALUES (?, ?, ?)',
                [user.id, verificationCode, expiresAt]
            );

            // Отправляем код 2FA
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Код двухфакторной аутентификации для Fictoria',
                text: `Ваш код двухфакторной аутентификации: ${verificationCode}\nКод действителен 15 минут.`
            });

            // Создаем временный токен для проверки 2FA
            const tempToken = jwt.sign({ id: user.id, nickname: user.nickname, is_2fa: true }, JWT_SECRET, { expiresIn: '15m' });

            return res.status(200).json({
                message: 'Код двухфакторной аутентификации отправлен на ваш email',
                tempToken,
                requires2FA: true
            });
        }

        // Если 2FA не требуется, выдаем полноценный токен
        const token = jwt.sign({ id: user.id, nickname: user.nickname }, JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const responseData = {
            message: 'Авторизация успешна',
            id: user.id,
            nickname: user.nickname,
            avatarUrl: user.avatar_url || '/images/userIcon.png',
            is_admin: user.is_admin
        };
        console.log('Login response sent:', responseData);
        res.status(200).json(responseData);
    } catch (error) {
        console.error('Ошибка при входе:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

export async function verify2FA(req, res) {
    const { tempToken, code } = req.body;

    if (!tempToken || !code) {
        return res.status(400).json({ message: 'Необходимо указать токен и код' });
    }

    try {
        // Проверяем временный токен
        const decoded = jwt.verify(tempToken, JWT_SECRET);
        if (!decoded.is_2fa) {
            return res.status(400).json({ message: 'Недействительный токен' });
        }

        const userId = decoded.id;

        // Проверяем код 2FA
        const [codes] = await db.promise().query(
            'SELECT * FROM verification_codes WHERE user_id = ? AND code = ?',
            [userId, code]
        );

        if (codes.length === 0) {
            return res.status(400).json({ message: 'Неверный код двухфакторной аутентификации' });
        }

        const verification = codes[0];
        if (new Date(verification.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Код двухфакторной аутентификации истек' });
        }

        // Удаляем использованный код
        await db.promise().query(
            'DELETE FROM verification_codes WHERE user_id = ?',
            [userId]
        );

        // Получаем данные пользователя
        const [users] = await db.promise().query('SELECT id, nickname, avatar_url, is_admin FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const user = users[0];

        // Выдаем полноценный токен
        const token = jwt.sign({ id: user.id, nickname: user.nickname }, JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: 'Двухфакторная аутентификация успешна',
            id: user.id,
            nickname: user.nickname,
            avatarUrl: user.avatar_url || '/images/userIcon.png',
            is_admin: user.is_admin
        });
    } catch (error) {
        console.error('Ошибка при проверке 2FA:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

export async function resend2FACode(req, res) {
    const { tempToken } = req.body;

    if (!tempToken) {
        return res.status(400).json({ message: 'Необходим временный токен' });
    }

    try {
        // Проверяем временный токен
        const decoded = jwt.verify(tempToken, JWT_SECRET);
        if (!decoded.is_2fa) {
            return res.status(400).json({ message: 'Недействительный токен' });
        }

        const userId = decoded.id;

        // Получаем email пользователя
        const [users] = await db.promise().query('SELECT email, is_admin, is_2fa_enabled FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const user = users[0];
        if (!user.is_2fa_enabled || user.is_admin) {
            return res.status(400).json({ message: '2FA не требуется для этого пользователя' });
        }

        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Удаляем старые коды
        await db.promise().query('DELETE FROM verification_codes WHERE user_id = ?', [userId]);

        // Создаем новый код
        await db.promise().query(
            'INSERT INTO verification_codes (user_id, code, expires_at) VALUES (?, ?, ?)',
            [userId, verificationCode, expiresAt]
        );

        // Отправляем новый код
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Новый код двухфакторной аутентификации для Fictoria',
            text: `Ваш новый код двухфакторной аутентификации: ${verificationCode}\nКод действителен 15 минут.`
        });

        res.status(200).json({ message: 'Новый код двухфакторной аутентификации отправлен' });
    } catch (error) {
        console.error('Ошибка при отправке кода 2FA:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

export async function resendVerificationCode(req, res) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email обязателен' });
    }

    try {
        const [users] = await db.promise().query('SELECT id, is_verified FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const user = users[0];
        if (user.is_verified) {
            return res.status(400).json({ message: 'Аккаунт уже подтвержден' });
        }

        const userId = user.id;
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Удаляем старые коды
        await db.promise().query('DELETE FROM verification_codes WHERE user_id = ?', [userId]);

        // Создаем новый код
        await db.promise().query(
            'INSERT INTO verification_codes (user_id, code, expires_at) VALUES (?, ?, ?)',
            [userId, verificationCode, expiresAt]
        );

        // Отправляем новый код
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Новый код подтверждения для Fictoria',
            text: `Ваш новый код подтверждения: ${verificationCode}\nКод действителен 15 минут.`
        });

        res.status(200).json({ message: 'Новый код подтверждения отправлен' });
    } catch (error) {
        console.error('Ошибка при отправке кода подтверждения:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

export async function checkAuth(req, res) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ isAuthenticated: false });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const [user] = await db.promise().query(
            'SELECT id, nickname, avatar_url, is_admin FROM users WHERE id = ?',
            [userId]
        );

        if (user.length === 0) {
            return res.status(401).json({ isAuthenticated: false });
        }

        res.status(200).json({
            isAuthenticated: true,
            user: {
                id: user[0].id,
                nickname: user[0].nickname,
                avatarUrl: user[0].avatar_url,
                is_admin: user[0].is_admin,
            },
        });
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        res.status(401).json({ isAuthenticated: false });
    }
}

export async function logoutUser(req, res) {
    try {
        console.log('Logout attempt');
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        console.log('Cookie cleared');
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

        const [user] = await db.promise().query(
            'SELECT id, email, nickname, name, status, avatar_url FROM users WHERE id = ?',
            [userId]
        );

        if (user.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const [categories] = await db.promise().query(
            'SELECT category FROM user_categories WHERE user_id = ?',
            [userId]
        );

        const userData = {
            id: user[0].id,
            email: user[0].email,
            nickname: user[0].nickname,
            name: user[0].name || '',
            status: user[0].status || '',
            avatarUrl: user[0].avatar_url || '/images/userIcon.png',
            categories: categories.map(c => c.category)
        };

        console.log('User profile fetched:', userData);
        res.status(200).json(userData);
    } catch (error) {
        console.error('Ошибка при получении профиля:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

export async function getCurrentUser(req, res) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Не авторизован' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const [user] = await db.promise().query(
            'SELECT id, email, nickname, name, status, avatar_url, is_admin FROM users WHERE id = ?',
            [userId]
        );

        if (user.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const [categories] = await db.promise().query(
            'SELECT category FROM user_categories WHERE user_id = ?',
            [userId]
        );

        const userData = {
            id: user[0].id,
            email: user[0].email,
            nickname: user[0].nickname,
            name: user[0].name || '',
            status: user[0].status || '',
            avatarUrl: user[0].avatar_url || '/images/userIcon.png',
            is_admin: user[0].is_admin,
            categories: categories.map(c => c.category),
        };

        console.log('Current user fetched:', userData);
        res.status(200).json(userData);
    } catch (error) {
        console.error('Ошибка при получении текущего пользователя:', error);
        res.status(401).json({ message: 'Недействительный токен' });
    }
}