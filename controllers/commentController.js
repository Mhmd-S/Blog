import * as commentService from  '../services/commentService';
import { body, validationResult } from 'express-validator';
import { verifyJWT, verifyAdminJWT } from '../authentication/jwtAuthentication';
import { AppError } from '../utils/errorHandler';

const getComment = [
    verifyJWT,
    async(req,res,next) => {
      try {  
        const commentId = req.params.commentId;
        const comment = await commentService.getComment(commentId);
        res.status(200).json({ status: "OK", data: comment });
        } catch(err) {
            next(err);
        }
      }
]

const createComment = [
    verifyJWT,
    body('content')
            .trim()
            .isLength({ min:1, max: 300 }).withMessage('Comments can have a minimum of 1 character and maximum if 300 characters')
            .escape(),
    async (req,res,next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new AppError('400', 'badRequest', errors.array());
        }
        try {
            const commentObj = {
                author: req.userId,
                content: req.body.content,
                date: new Date(),
                post: req.params.postId
            }
            const comment = await commentService.createComment(commentObj);
            res.status(201).json({status: "OK", data: comment});
        } catch (err) {
            console.log(err)
            next(err);
        }
    }
]

const deleteComment = [
    verifyAdminJWT,
    async (req,res,next) => {
        try {
            await commentService.deleteComment(req.params.commentId);
            res.status(200).json({status: "OK", message: 'Comment Deleted Successfully' });
        } catch(err) {
            next(err);
        }
    }
]

export { getComment , createComment, deleteComment };