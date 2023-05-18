import express from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import { verifyJWT, verifyAdminJWT } from '../authentication/jwtAuthentication';
import Comment from '../models/CommentModel'
import Post from '../models/PostModel';
import * as commentController from '../controllers/commentController';
let router = express.Router();

router.get('/:commentId', commentController.getComment );

router.put('/:postId', 
            verifyJWT,
            body('content')
            .trim()
            .isLength({ min:1, max: 300 }).withMessage('Comments can have a minimum of 1 character and maximum if 300 characters')
            .escape(),
            (req,res,next) => {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({ success: false, message: errors })
                    return;
                }

                const newComment = new Comment({
                    author: req.userId,
                    content: req.body.content,
                    date: new Date(),
                    post: req.params.postId
                })

                newComment.save()
                    .then((result)=>{
                        console.log(result)
                        Post.updateOne({ _id: req.params.postId },
                                       {$push: {comments:  result._id}
                        })
                        .then(()=>{
                            res.status(201).json({ status: 'OK', data: 'Comment added successfully'}) // Add the createed workout instead of message
                        })
                        .catch(e => {
                            console.log(e);
                            res.status(501).json({ success: false, message: 'Could not add comment'})
                            return;
                        })
                    })
                    .catch(e => {
                        console.log(e);
                        res.status(501).json({ success: false, message: 'Could not add comment'})
                        return;
                    })
            })

router.delete('/:postId/:commentId', // No need for postId just use the post id found in the comment
                verifyAdminJWT,
                (req,res,next) => {

                    const deleteCommentDoc = Comment.deleteOne({ _id: req.params.commentId});

                    const deletCommentFromPost = Post.updateOne({ _id: req.params.postId },
                        { $pull: { comments: new mongoose.Types.ObjectId(req.params.commentId) } })

                    Promise.all([deleteCommentDoc, deletCommentFromPost])
                        .then((results)=>{
                            console.log(results)
                            res.status(204).json({ status: "OK" })
                        }).catch(e => {
                            console.log(e);
                            res.status(501).json({ sucess: false, message: 'Comment could not be deleted' })
                        })
                })

export default router;