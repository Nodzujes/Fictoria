import express from 'express';
import { getComments, createComment } from '../controllers/commentsController.js';

const router = express.Router();

router.get('/:postId', getComments);
router.post('/:postId', createComment);

export default router;