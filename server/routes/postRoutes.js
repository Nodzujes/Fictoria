import express from 'express';
import { createPost, getAllPosts, getUserPosts, toggleLike, getLikedPosts, getPostById, getPostBlocks } from '../controllers/postController.js';

const router = express.Router();

router.post('/create', createPost);
router.get('/all', getAllPosts);
router.get('/user/:userId', getUserPosts);
router.get('/like/:postId', toggleLike);
router.post('/like/:postId', toggleLike);
router.get('/liked/:userId', getLikedPosts);
router.get('/:id', getPostById);
router.get('/blocks/:id', getPostBlocks);

export default router;