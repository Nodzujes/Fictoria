import express from 'express';
import { createPost, getAllPosts, getUserPosts, toggleLike, getLikedPosts } from '../controllers/postController.js';

const router = express.Router();

router.post('/create', createPost);
router.get('/all', getAllPosts);
router.get('/user/:userId', getUserPosts);
router.post('/like/:postId', toggleLike);
router.get('/liked/:userId', getLikedPosts);

export default router;