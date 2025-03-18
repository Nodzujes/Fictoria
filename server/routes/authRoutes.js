import express from 'express';
import { regUser, loginUser, checkAuth, logoutUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', regUser);
router.post('/login', loginUser);
router.get('/check', checkAuth);
router.post('/logout', logoutUser); // Новый маршрут для выхода

export default router;