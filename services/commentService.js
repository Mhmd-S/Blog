import { AppError } from "../utils/errorHandler";
import Comment from "../models/CommentModel";
import Post from "../models/PostModel";

const getComment = async (commentId) => { // This should be in the post 
    const comment = await Comment.findById(commentId).exec();
    return comment;
  };
  

const createComment = () => {
    return;
}

const deleteComment = () => {
    return;
}

export { getComment, createComment, deleteComment };