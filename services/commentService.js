import { AppError } from "../utils/errorHandler";
import Comment from "../models/CommentModel";
import Post from "../models/PostModel";
import mongoose from 'mongoose'; 

const getComment = async (commentId) => { // This should be in the post 
    const comment = await Comment.findById(commentId).exec();
    if (comment === null ) {
        throw new AppError(400, 'The :commentId parameter specified an invalid comment ID.')
    }
    return comment;
};

const createComment = async (commentObj) => {
    try{
        const post = await Post.findById(commentObj.post).exec();
        if (post === null) {
            throw new AppError(400, 'The :postId parameter specified an invalid post ID.' )
        }
        const newComment = new Comment({...commentObj}); 
        const saveCommentResult = await newComment.save();
        const updatePostComment = await Post.findByIdAndUpdate(commentObj.post , {$push: {comments: new mongoose.Types.ObjectId(saveCommentResult._id) }}).exec();
        return saveCommentResult;
    } catch(err) {
        throw err;
    }
}

const deleteComment = async(commentId) => {
    
    const comment = await Comment.findById(commentId).exec();
    
    if (comment === null ) {
        throw new AppError(400, 'Invalid parameter', 'The :commentId parameter specified an invalid comment ID.')
    }

    const deleteCommentDoc = Comment.deleteOne({ _id: commentId});
    const deletCommentFromPost = Post.findOneAndUpdate({ _id: comment.post },
                                                    { $pull: { comments: new mongoose.Types.ObjectId(commentId) } })

    Promise.all([deleteCommentDoc, deletCommentFromPost])
        .then((results)=>{
            return results;
        }).catch(err => {
            throw err;
        })
}

export { getComment, createComment, deleteComment };