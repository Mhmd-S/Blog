import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Post = new Schema ({
    title: { type: String, require: true },
    content:{ type: String, require: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, require: true}
})

export default mongoose.Model('Post', Post);