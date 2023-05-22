import express from 'express';
import * as postController from '../controllers/postController';

let router = express.Router();

// Get a certain post using its id
router.get('/:postId', postController.getPost);

// Get all a certain amount of posts
router.get('/', postController.getPosts);

// Create a post
router.post('/create-post', postController.createPost);

// Update a post
router.put('/:postId', postController.updatePost);

// Delete a post
router.delete(':postId', postController.deletePost );
            
export default router;