import db from '../config/db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

//Функция для получения комментариев для поста
export async function getComments(req, res) {
    const { postId } = req.params;

    try {
        const [comments] = await db.promise().query(
            `SELECT pc.id, pc.coment, pc.created_at, u.id AS user_id, u.nickname, u.avatar_url
             FROM posts_comments pc
             JOIN users u ON pc.id_user = u.id
             WHERE pc.id_post = ?
             ORDER BY pc.created_at DESC`,
            [postId]
        );
        res.status(200).json(comments);
    } catch (error) {
        console.error('Ошибка при получении комментариев:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

//Функцтя для создания комментария
export async function createComment(req, res) {
    const { postId } = req.params;
    const { comment } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Не авторизован' });
    }

    if (!comment || comment.trim() === '') {
        return res.status(400).json({ message: 'Комментарий не может быть пустым' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const [result] = await db.promise().query(
            'INSERT INTO posts_comments (id_post, id_user, coment) VALUES (?, ?, ?)',
            [postId, userId, comment]
        );

        // Получаем созданный комментарий с данными пользователя
        const [newComment] = await db.promise().query(
            `SELECT pc.id, pc.coment, pc.created_at, u.id AS user_id, u.nickname, u.avatar_url
             FROM posts_comments pc
             JOIN users u ON pc.id_user = u.id
             WHERE pc.id = ?`,
            [result.insertId]
        );

        res.status(201).json(newComment[0]);
    } catch (error) {
        console.error('Ошибка при создании комментария:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}