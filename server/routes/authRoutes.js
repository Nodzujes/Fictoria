import express from 'express';
import { regUser, loginUser, checkAuth, logoutUser, updateUserProfile } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', regUser);
router.post('/login', loginUser);
router.get('/check', checkAuth);
router.post('/logout', logoutUser);
router.post('/update-profile', updateUserProfile); // Новый маршрут

export default router;