import express from 'express';
import { regUser, loginUser, checkAuth, logoutUser, updateUserProfile, getUserProfile, verifyUser, resendVerificationCode, getCurrentUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', regUser);
router.post('/login', loginUser);
router.get('/check', checkAuth);
router.post('/logout', logoutUser);
router.post('/update-profile', updateUserProfile);
router.get('/profile', getUserProfile);
router.post('/verify', verifyUser);
router.post('/resend-verification', resendVerificationCode);
router.get('/me', getCurrentUser);

export default router;