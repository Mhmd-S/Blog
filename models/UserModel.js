import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const User = new Schema({
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    isAdmin: {
        type: Boolean,
        require: true
    }
})

export default mongoose.Model('User', User);