import express from 'express';
import { createPost, getAllPosts, getUserPosts, toggleLike, getLikedPosts, getPostById, getPostBlocks, searchPosts, getPostsByCategory, getMyFeed, getPendingPosts, approvePost } from '../controllers/postController.js';

const router = express.Router();

router.post('/create', createPost);
router.get('/all', getAllPosts);
router.get('/user/:userId', getUserPosts);
router.get('/like/:postId', toggleLike);
router.post('/like/:postId', toggleLike);
router.get('/liked/:userId', getLikedPosts);
router.get('/category/:category', getPostsByCategory);
router.get('/my-feed/:userId', getMyFeed);
router.get('/search', searchPosts);
router.get('/pending', getPendingPosts); // Перемещен выше
router.get('/blocks/:id', getPostBlocks);
router.get('/:id', getPostById); // Теперь ниже /pending
router.post('/approve/:postId', approvePost);

export default router;