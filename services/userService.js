import User from '../models/UserModel';
import { AppError } from '../utils/errorHandler'; 
import bcrypt from 'bcryptjs';

const getUser = async(userId) => {
    const user = await User.findById(userId, '_id username').exec();
    if (user === null) throw new AppError(400, 'Invalid user Id');
    return user;
}

const addUser = async(userObj) => {
    bcrypt.hash(userObj.password, 10, (err, hash) => {
        if (err) {
            throw new AppError(500, "User couldn't be created");
        }

        userObj.password = hash

        const user = new User({
            ...userObj
        });

        user.save()
            .then((result) => {
                return result;
            })
            .catch((err)=> {
                throw new AppError(500, "User couldn't be created");
            });
    } );
}

const deleteUser = (userId) => {
    User.deleteOne({ _id: userId })
            .then((result)=>{
                return result
            })
}


export { getUser, addUser, deleteUser };
