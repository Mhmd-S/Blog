import express from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import { verifyJWT, verifyAdminJWT } from '../authentication/jwtAuthentication';
import Comment from '../models/CommentModel'
import Post from '../models/PostModel';
import * as commentController from '../controllers/commentController';
let router = express.Router();

router.get('/:commentId', commentController.getComment );

router.put('/:postId', commentController.createComment );

router.delete('/:postId/:commentId', // No need for postId just use the post id found in the comment
                verifyAdminJWT,
                (req,res,next) => {

                    const deleteCommentDoc = Comment.deleteOne({ _id: req.params.commentId});

                    const deletCommentFromPost = Post.findOneAndUpdate({ _id: req.params.postId },
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