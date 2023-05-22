import { body, validationResult } from 'express-validator';
import { verifyJWT, verifyAdminJWT } from '../authentication/jwtAuthentication';
import { AppError } from '../utils/errorHandler';
import * as postService from '../services/postService';

const getPost = [
    verifyJWT,
    async(req,res,next) => {
        try {
            const postId = req.params.postId;
            if (!postId) throw new AppError(400,' The :postId parameter specified an invalid post ID.');
            const post = await postService.getPost(postId);
            res.status(200).json({status:"OK", result: post })
        } catch (err) {
            next(err);
        }
    }
]

const getPosts = [
    verifyJWT,
    async(req,res,next) => {
        try {
            const page = req.query.page;
            if (!page) throw new AppError(400, 'The :page parameter is invalid.')
            const posts = await postService.getPosts(page); 
            res.status(200).json({status:"OK", result: posts});
        } catch (err) {
            next(err);
        }
    }
]

const createPost = [
    verifyAdminJWT,
    body('title')
    .trim()
    .not().isEmpty().withMessage('Title can not be empty!')
    .escape(),
    body('content')
    .trim()
    .isLength({ min:1, max: 1250 }).withMessage('Content size should be atleast 1 character and a maximum of 1250')
    .escape(),
    async(req,res,next) => {
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new AppError(400, errors.array());
            }

            const postInfo = {
                title: req.body.title,
                content: req.body.content,
                author: req.userId, // Recieved when verifying the cookies
                date: new Date(),
                lastUpdate: new Date()
            }

            const post = await postService.createPost(postInfo);
            res.status(200).json({status: "OK", result: post});
        } catch (err) {
            console.log(err);
            next(err);
        }
    }
]

const updatePost = [
    verifyAdminJWT,
    body('title')
    .trim()
    .not().isEmpty().withMessage('Title can not be empty!')
    .escape(),
    body('content')
    .trim()
    .isLength({ min:1, max: 1250 }).withMessage('Content size should be atleast 1 character and a maximum of 1250')
    .escape(),
    async(req,res,next) => {
        try{
            const postId = req.params.postId;
            if (!postId) throw new AppError(400,' The :postId parameter specified an invalid post ID.');

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new AppError(400, errors.array());
            }

            const newPostInfo = {
                title: req.body.title,
                content: req.body.content,
                author: req.userId, // Recieved when verifying the cookies
                lastUpdate: new Date()
            }

            const postResult = await postService.updatePost(postId, newPostInfo);
            res.status(200).json({ status:"OK", result: postResult });
        } catch(err) {
            console.log(err);
            next(err);
        }
    }
]

const deletePost = [
    verifyAdminJWT,
    async(req,res,next) => {
        try {
            const postId = req.params.postId;
            if (!postId) throw new AppError(400,' The :postId parameter specified an invalid post ID.');
            const deleteResult = postService.deletePost(postId);
            res.status(200).json({ status:"OK", result: deleteResult
         })
        }catch (err) {
            next(err);
        }
    }
]

export { getPost, getPosts, createPost, updatePost, deletePost };