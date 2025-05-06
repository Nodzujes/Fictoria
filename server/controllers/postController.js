import db from '../config/db.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadDir;
        if (file.fieldname === 'cover') {
            uploadDir = 'public/uploads/covers'
        } else if (file.fieldname.startsWith('images_')) {
            uploadDir = 'public/uploads/images';
        } else if (file.fieldname.startsWith('video_')) {
            uploadDir = 'public/uploads/videos';
        }
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (!file || !file.originalname) {
            return cb(new Error('Файл не предоставлен или имеет неверный формат'));
        }
        let filetypes;
        if (file.fieldname === 'cover' || file.fieldname.startsWith('images_')) {
            filetypes = /jpeg|jpg|png|gif/;
        } else if (file.fieldname.startsWith('video_')) {
            filetypes = /jpeg|jpg|png|gif|mp4|mkv/;
        }
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Неверный формат файла'));
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).any();

export async function createPost(req, res) {
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

            const { title, introduction, categories, blocks } = req.body;
            const parsedCategories = JSON.parse(categories);
            const parsedBlocks = JSON.parse(blocks);

            // Проверяем обязательные поля
            if (!title || !introduction || parsedCategories.length === 0) {
                return res.status(400).json({ message: 'Заполните все обязательные поля: заголовок, введение и категории' });
            }

            if (!req.files || !req.files.some(file => file.fieldname === 'cover')) {
                return res.status(400).json({ message: 'Обложка обязательна' });
            }

            // Находим файл обложки
            const coverFile = req.files.find(file => file.fieldname === 'cover');
            const coverUrl = `/uploads/covers/${coverFile.filename}`;

            // Вставляем пост в таблицу `posts`
            const [postResult] = await db.promise().query(
                'INSERT INTO posts (user_id, title, introduction, cover_url) VALUES (?, ?, ?, ?)',
                [userId, title, introduction, coverUrl]
            );
            const postId = postResult.insertId;

            // Обрабатываем категории
            for (const category of parsedCategories) {
                const [categoryResult] = await db.promise().query(
                    'SELECT id FROM categories WHERE name = ?',
                    [category]
                );
                if (categoryResult.length > 0) {
                    const categoryId = categoryResult[0].id;
                    await db.promise().query(
                        'INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)',
                        [postId, categoryId]
                    );
                }
            }

            // Обрабатываем блоки
            for (const block of parsedBlocks) {
                if (block.type === 'text') {
                    await db.promise().query(
                        'INSERT INTO post_blocks (post_id, type, `order`, title, content) VALUES (?, ?, ?, ?, ?)',
                        [postId, block.type, block.order, block.title, block.content]
                    );
                } else if (block.type === 'images') {
                    const mediaUrls = Array(4).fill(null);
                    block.mediaFiles.forEach((_, fileIndex) => {
                        const file = req.files.find(f => f.fieldname === `images_${block.order-1}_${fileIndex}`);
                        if (file) {
                            mediaUrls[fileIndex] = `/uploads/images/${file.filename}`;
                        }
                    });
                    await db.promise().query(
                        'INSERT INTO post_blocks (post_id, type, `order`, media_urls) VALUES (?, ?, ?, ?)',
                        [postId, block.type, block.order, JSON.stringify(mediaUrls)]
                    );
                } else if (block.type === 'videos') {
                    const file = req.files.find(f => f.fieldname === `video_${block.order-1}`);
                    const mediaUrl = file ? `/uploads/videos/${file.filename}` : null;
                    await db.promise().query(
                        'INSERT INTO post_blocks (post_id, type, `order`, media_urls) VALUES (?, ?, ?, ?)',
                        [postId, block.type, block.order, JSON.stringify([mediaUrl])]
                    );
                }
            }

            res.status(201).json({ message: 'Пост успешно создан' });
        } catch (error) {
            console.error('Ошибка при создании поста:', error);
            res.status(500).json({ message: 'Ошибка сервера', error: error.message });
        }
    });
}