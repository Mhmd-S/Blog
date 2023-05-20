import Post from '../models/PostModel'
import { AppError } from '../utils/errorHandler';

const getPost = async(postId) => {
    const post = await Post.findById(postId).populate('comments').exec();
    if (post === null) {
        throw new AppError(400,' The :postId parameter specified an invalid post ID.');
    }
    return post;
}

const getPosts = async() => {
    // Continue here
    const posts = await Post.find({}).sort({ date: 'desc' }).limit(7);
}

export { getPost, getPosts };