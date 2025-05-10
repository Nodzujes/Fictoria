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
            uploadDir = 'public/uploads/covers';
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
    limits: { fileSize: 10 * 1024 * 1024 }
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
            let parsedCategories;
            try {
                parsedCategories = JSON.parse(categories);
            } catch (error) {
                console.error('Ошибка парсинга категорий:', error, 'Полученные категории:', categories);
                return res.status(400).json({ message: 'Неверный формат категорий' });
            }

            console.log('Полученные категории:', parsedCategories);

            if (!title || !introduction || parsedCategories.length === 0) {
                return res.status(400).json({ message: 'Заполните все обязательные поля: заголовок, введение и категории' });
            }

            if (!req.files || !req.files.some(file => file.fieldname === 'cover')) {
                return res.status(400).json({ message: 'Обложка обязательна' });
            }

            const coverFile = req.files.find(file => file.fieldname === 'cover');
            const coverUrl = `/uploads/covers/${coverFile.filename}`;

            const [postResult] = await db.promise().query(
                'INSERT INTO posts (user_id, title, introduction, cover_url) VALUES (?, ?, ?, ?)',
                [userId, title, introduction, coverUrl]
            );
            const postId = postResult.insertId;

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
                } else {
                    console.warn(`Категория "${category}" не найдена в базе данных`);
                }
            }

            const parsedBlocks = JSON.parse(blocks);
            for (const block of parsedBlocks) {
                if (block.type === 'text') {
                    await db.promise().query(
                        'INSERT INTO post_blocks (post_id, type, `order`, title, content) VALUES (?, ?, ?, ?, ?)',
                        [postId, block.type, block.order, block.title, block.content]
                    );
                } else if (block.type === 'images') {
                    const mediaUrls = Array(4).fill(null);
                    block.mediaFiles.forEach((_, fileIndex) => {
                        const file = req.files.find(f => f.fieldname === `images_${block.order - 1}_${fileIndex}`);
                        if (file) {
                            mediaUrls[fileIndex] = `/uploads/images/${file.filename}`;
                        }
                    });
                    await db.promise().query(
                        'INSERT INTO post_blocks (post_id, type, `order`, media_urls) VALUES (?, ?, ?, ?)',
                        [postId, block.type, block.order, JSON.stringify(mediaUrls)]
                    );
                } else if (block.type === 'videos') {
                    const file = req.files.find(f => f.fieldname === `video_${block.order - 1}`);
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

export async function getAllPosts(req, res) {
    try {
        const [posts] = await db.promise().query(`
            SELECT 
                p.id,
                p.user_id,
                p.title,
                p.introduction,
                p.cover_url,
                u.nickname,
                u.avatar_url,
                JSON_ARRAYAGG(c.name) as categories
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN post_categories pc ON p.id = pc.post_id
            LEFT JOIN categories c ON pc.category_id = c.id
            GROUP BY p.id, p.user_id, p.title, p.introduction, p.cover_url, u.nickname, u.avatar_url
        `);

        res.status(200).json(posts);
    } catch (error) {
        console.error('Ошибка при получении постов:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

export async function getPostsByCategory(req, res) {
    try {
        const { category } = req.params;
        console.log('Получен запрос для категории:', category);
        const [posts] = await db.promise().query(`
            SELECT 
                p.id,
                p.user_id,
                p.title,
                p.introduction,
                p.cover_url,
                u.nickname,
                u.avatar_url,
                JSON_ARRAYAGG(c.name) as categories
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN post_categories pc ON p.id = pc.post_id
            LEFT JOIN categories c ON pc.category_id = c.id
            WHERE c.name = ?
            GROUP BY p.id, p.user_id, p.title, p.introduction, p.cover_url, u.nickname, u.avatar_url
        `, [category]);

        console.log('Найденные посты для категории:', posts);
        res.status(200).json(posts);
    } catch (error) {
        console.error('Ошибка при получении постов по категории:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

export async function getMyFeed(req, res) {
    try {
        const { userId } = req.params;
        console.log('Получен запрос для Моя лента, userId:', userId);
        const [posts] = await db.promise().query(`
            SELECT 
                p.id,
                p.user_id,
                p.title,
                p.introduction,
                p.cover_url,
                u.nickname,
                u.avatar_url,
                JSON_ARRAYAGG(c.name) as categories
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN post_categories pc ON p.id = pc.post_id
            LEFT JOIN categories c ON pc.category_id = c.id
            JOIN user_categories uc ON uc.category = c.name
            WHERE uc.user_id = ?
            GROUP BY p.id, p.user_id, p.title, p.introduction, p.cover_url, u.nickname, u.avatar_url
        `, [userId]);

        console.log('Найденные посты для Моя лента:', posts);
        res.status(200).json(posts);
    } catch (error) {
        console.error('Ошибка при получении постов для Моя лента:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

export async function getUserPosts(req, res) {
    try {
        const { userId } = req.params;
        console.log('Получен запрос для userId:', userId);
        const [posts] = await db.promise().query(`
            SELECT 
                p.id,
                p.user_id,
                p.title,
                p.introduction,
                p.cover_url,
                u.nickname,
                u.avatar_url,
                JSON_ARRAYAGG(c.name) as categories
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN post_categories pc ON p.id = pc.post_id
            LEFT JOIN categories c ON pc.category_id = c.id
            WHERE p.user_id = ?
            GROUP BY p.id, p.user_id, p.title, p.introduction, p.cover_url, u.nickname, u.avatar_url
        `, [userId]);
        console.log('Найденные посты:', posts);
        res.status(200).json(posts);
    } catch (error) {
        console.error('Ошибка при получении постов пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

export async function toggleLike(req, res) {
    const token = req.cookies.token;
    console.log('Toggle like token:', token);
    if (!token) {
        return res.status(401).json({ message: 'Не авторизован' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Toggle like decoded:', decoded);
        const userId = decoded.id;
        const { postId } = req.params;

        // Проверяем, существует ли пост
        const [post] = await db.promise().query('SELECT id FROM posts WHERE id = ?', [postId]);
        console.log('Post check:', post);
        if (post.length === 0) {
            return res.status(404).json({ message: 'Пост не найден' });
        }

        // Проверяем, есть ли уже лайк
        const [existingLike] = await db.promise().query(
            'SELECT * FROM likes WHERE user_id = ? AND post_id = ?',
            [userId, postId]
        );
        console.log('Existing like:', existingLike);

        if (req.method === 'GET') {
            // Если GET-запрос, возвращаем статус лайка
            return res.status(200).json({ liked: existingLike.length > 0 });
        }

        if (existingLike.length > 0) {
            // Удаляем лайк
            await db.promise().query(
                'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
                [userId, postId]
            );
            res.status(200).json({ message: 'Лайк удален', liked: false });
        } else {
            // Добавляем лайк
            await db.promise().query(
                'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
                [userId, postId]
            );
            res.status(200).json({ message: 'Лайк добавлен', liked: true });
        }
    } catch (error) {
        console.error('Ошибка при обработке лайка:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

export async function getLikedPosts(req, res) {
    try {
        const { userId } = req.params;
        console.log('Получен запрос для liked posts userId:', userId);
        const [posts] = await db.promise().query(`
            SELECT 
                p.id,
                p.user_id,
                p.title,
                p.introduction,
                p.cover_url,
                u.nickname,
                u.avatar_url,
                JSON_ARRAYAGG(c.name) as categories
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN post_categories pc ON p.id = pc.post_id
            LEFT JOIN categories c ON pc.category_id = c.id
            JOIN likes l ON p.id = l.post_id
            WHERE l.user_id = ?
            GROUP BY p.id, p.user_id, p.title, p.introduction, p.cover_url, u.nickname, u.avatar_url
        `, [userId]);
        console.log('Найденные лайкнутые посты:', posts);
        res.status(200).json(posts);
    } catch (error) {
        console.error('Ошибка при получении лайкнутых постов:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

export async function getPostById(req, res) {
    try {
        const { id } = req.params;
        const [posts] = await db.promise().query(`
      SELECT 
        p.id,
        p.user_id,
        p.title,
        p.introduction,
        p.cover_url,
        u.nickname,
        u.avatar_url,
        JSON_ARRAYAGG(c.name) as categories
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.id = ?
      GROUP BY p.id, p.user_id, p.title, p.introduction, p.cover_url, u.nickname, u.avatar_url
    `, [id]);
        if (posts.length === 0) {
            return res.status(404).json({ message: 'Пост не найден' });
        }
        res.status(200).json(posts[0]);
    } catch (error) {
        console.error('Ошибка при получении поста:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

export async function getPostBlocks(req, res) {
    try {
        const { id } = req.params;
        const [blocks] = await db.promise().query(`
      SELECT 
        id,
        post_id,
        type,
        \`order\`,
        title,
        content,
        media_urls
      FROM post_blocks
      WHERE post_id = ?
      ORDER BY \`order\`
    `, [id]);
        res.status(200).json(blocks);
    } catch (error) {
        console.error('Ошибка при получении блоков поста:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

export async function searchPosts(req, res) {
    console.log('Получен запрос на поиск с query:', req.query);
    try {
        const { query } = req.query;
        if (!query) {
            console.log('Ошибка: поисковый запрос отсутствует');
            return res.status(400).json({ message: 'Поисковый запрос обязателен' });
        }

        console.log('Выполняется SQL-запрос с query:', query);
        const [posts] = await db.promise().query(`
            SELECT 
                p.id,
                p.user_id,
                p.title,
                p.introduction,
                p.cover_url,
                u.nickname,
                u.avatar_url
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE LOWER(p.title) LIKE LOWER(?)
        `, [`%${query}%`]);
        console.log('Найдено постов:', posts.length, 'Посты:', posts);
        res.status(200).json(posts);
    } catch (error) {
        console.error('Ошибка при поиске постов:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}