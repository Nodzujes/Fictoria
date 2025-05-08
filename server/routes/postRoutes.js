import express from 'express';
import { createPost, getAllPosts, getUserPosts } from '../controllers/postController.js';

const router = express.Router();

router.post('/create', createPost);
router.get('/all', getAllPosts);
router.get('/user/:userId', getUserPosts);

export default router;