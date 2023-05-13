import mongoose, { Schema } from 'mongoose';

const Comment = mongoose.model('Comment', new Schema ({
    author: { type: Schema.Types.ObjectId, ref: 'User' , required: true },
    post: { type: Schema.Types.ObjectId, ref:'Post' ,require: true },
    content: { type: String, required: true },
    date: { type: Date, required: true }
}))

export default Comment;