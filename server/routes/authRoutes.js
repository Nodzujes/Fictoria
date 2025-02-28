import express from 'express';
import { regUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', regUser);
router.post('/login', loginUser);

export default router;