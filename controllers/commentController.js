import * as commentService from  '../services/commentService';
import express from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import { verifyJWT, verifyAdminJWT } from '../authentication/jwtAuthentication';
import Comment from '../models/CommentModel'
import Post from '../models/PostModel';
import * as commentController from '../controllers/commentController';
import { AppError } from '../utils/errorHandler';

const getComment = [
    verifyJWT,
    (req,res,next) => {
      try {  
        const commentId = req.params.commentId; // Test this ^^^
        if (!commentId || commentId.length !== 24 ) {
          throw new AppError ('Invalid Parameter' , 400, 'Invalid :commentId parameter');
        }
        const comments = commentService.getComment(commentId);
        res.status(200).json({ status: "OK", data: comments });
        } catch(err) {
            next(err);
        }
      }
]

const createComment = () => {
    return;
}

const deleteComment = () => {
    return;
}

export { getComment , createComment, deleteComment };