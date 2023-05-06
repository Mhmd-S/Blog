import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/UserModel';
import { body, validationResult } from 'express-validator';
import passport from 'passport';
import jwt from 'jsonwebtoken';

import '../passport'; // Imports the strategies that will be used by passport

let router = express.Router();

router.get('/:userId', passport.authenticate('jwt', { session: false }), asyncHandler( async(req,res,next) => {
    // Fetch the user information from mongo using the id
    const userInfo = await User.findOne({ _id: req.params.userId});
    
    if (userInfo) {   // Return object to user if found
        res.status(200).json({
            username: userInfo.username,
            _id: userInfo._id
        })
        return;
    }

    throw new Error('Resource could not be found');
}));

router.post('/add-user',
    body('email') // Validates the email
    .isEmail().withMessage('Invalid Email')
    .escape(),
    body('username') // Validates the username
    .isLength({ min: 1, max: 16}).withMessage('The minimum characters for username is 1 and maximum is 16')
    .escape(),
    body('password') // Validates the password
    .isStrongPassword().withMessage("Password min length is 8. Needs to contain atleast 1 lowercase, uppercase, symbol and number")
    .custom((value, { req } ) => { // Checks if the two passwords are the same.
        if (value !== req.body.confirmPassword){
            throw new Error("Passwords are not the same");
        }

        if (value === req.body.username || value === req.body.email) {
            throw new Error("Password can not be the same as the username");
        }

        return value;
    })
    .escape(),
    asyncHandler(async(req,res,next) => {
        // Checks for validation errors on the form data that was recivied
        const errors = validationResult(req);

        // Send errors if found
        if(!errors.isEmpty()){
            res.send(errors);
            return;
        }

        // Setup the encryption and saving the info
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
                throw new Error('Error with hashing!');
            }

            const user = new User({
                username: req.body.username,
                email: req.body.email,
                password: hash
            });

            user.save()
                .then(() => {
                    res.json({message: 'User created succesfully'});    
                })
                .catch((err)=> {
                    throw new Error(err);
                });
        } );
    })
);

// Using the local strategy we authenticate the user. If the auth is successfull we generate a token and send it to the user
router.post('/sign-in', function (req, res, next) {
    passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: 'Something is not right'
            });
        }
    
        req.login(user, { session: false }, (err) => {
            if (err) {
                res.json({error: err});
            }     

        // generate a signed son web token with the contents of user object and return it in the response  
            const token = jwt.sign(user.toJSON(), process.env.JWT_KEY);
            return res.json({ user, token });
        });
    })(req, res, next);
});

router.post('/')

export default router;