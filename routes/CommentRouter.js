import express from 'express';
import * as commentController from '../controllers/commentController';

let router = express.Router();

router.get('/:commentId', commentController.getComment );

router.put('/:postId', commentController.createComment );

router.delete('/:commentId', commentController.deleteComment )

export default router;