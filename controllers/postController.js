import { body, validationResult } from 'express-validator';
import { verifyJWT, verifyAdminJWT } from '../authentication/jwtAuthentication';
import { AppError } from '../utils/errorHandler';
import * as postService from '../services/postService';

const getPost = [
    verifyJWT,
    async(req,res,next) => {
        try {
            const postId = req.params.postId;
            if (!numberOfPosts) throw new AppError(400,' The :postId parameter specified an invalid post ID.');
            const post = await postService.getPost(postId);
            res.status(200).json({status:"OK", data: post })
        } catch (err) {
            next(err);
        }
    }
]

const getPosts = [
    verifyJWT,
    async(req,res,next) => {
        try {
            const posts = await  
        } catch (err) {
            next(err);
        }
    }
]

export {getPost}