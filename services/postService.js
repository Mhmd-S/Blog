import Post from '../models/PostModel'
import { AppError } from '../utils/errorHandler';

const getPost = async(postId) => {
    const post = await Post.findById(postId).populate('comments').exec();
    if (post === null) throw new AppError(400,'Invalid :postId parameter');
    return post;
}

const getPosts = async(page) => {
    console.log(page)
    const posts = await Post.find({}).sort({ date: 'desc' }).skip((page-1)*7).limit(7);
    return posts;
}

const createPost = async(postObj) => {
    const newPost = new Post({...postObj});
    const savePostResult = newPost.save();
    return savePostResult;
}

const updatePost = async(postId,newPostObj) => {
    const post = await Post.findById(postId).populate('comments').exec();
    if (post === null) throw new AppError(400, 'Invalid :postId parameter');

    const updatePost = await Post.updateOne({_id: postId}, {
        ...newPostObj
    });

    if(updatePost.modifiedCount === 1) {
        return 'Post modified successfully'
    } else {
        throw new AppError(500, "Post couldn't be modified'");
    }
}

const deletePost = async(postId) => {
    const post = await Post.findById(postId).populate('comments').exec();
    if (post === null) throw new AppError(400,' Invalid :postId parameter');

    const result = await Post.findByIdAndRemove(postId);
    return result;
}
    

export { getPost, getPosts, createPost, updatePost, deletePost };