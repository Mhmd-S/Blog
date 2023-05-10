import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Post = mongoose.model('Post', new Schema ({
    title: { type: String, required: true },
    content:{ type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true},
    lastUpdate: { type: Date, required: true}
}));

export default Post;