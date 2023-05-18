import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/UserModel';
import { body, validationResult } from 'express-validator';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {verifyJWT, verifyAdminJWT} from '../authentication/jwtAuthentication';

import '../authentication/passport'; // Imports the strategies that will be used by passport
import Post from '../models/PostModel';

let router = express.Router();

router.get('/:userId', verifyJWT, (req,res,next) => {
    // Fetch the user information from mongo using the id
    User.findOne({ _id: req.params.userId })
        .then(userInfo => {
            res.status(200).json({
                username: userInfo.username,
                _id: userInfo._id
            })
        })
        .catch(e => { 
            res.status(400).json({ error: 'User could not be found' });
        });
});

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
            res.status(400).json({ error: errors.array() });
            return;
        }

        // Setup the encryption and saving the info
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
                res.status(400).json({error: 'Could not create user'})
                throw new Error('Error with hashing!');
            }

            const user = new User({
                username: req.body.username,
                email: req.body.email,
                password: hash
            });

            user.save()
                .then((result) => {
                    res.json({message: 'User created succesfully'});    
                })
                .catch((err)=> {
                    res.status(400).json({message: 'Could not create user'})
                    throw new Error(err);
                });
        } );
    })
);

router.delete('/:userId', verifyAdminJWT, (req,res,next) => {
    User.deleteOne({ _id: req.params.userId })
        .then(()=>
            res.status(200).json({ success: true, message: 'User deleted successfully' })
        )
        .catch(err => {
            res.status(501).json({ success: false, message: 'Could not delete user' });
        })
});

// Using the local strategy we authenticate the user. If the auth is successfull we generate a token and send it to the user
router.post('/sign-in', (req, res, next)  => {
    passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                success: false,
                message: err
            });
        }
    
        req.login(user, { session: false }, (err) => {
            if (err) {
                return res.status(400).json({error: err});
            }     

            // JWT payload 
            const jwtPayload = {
                _id: user._id,
                emaill: user.email
            }

            let accessToken;
            let accessTokenAdmin;
            let refreshToken;

            try{
                if (user.isAdmin) { // Check if user is admin and use the suitable env variable
                    // generate a signed son web token with the contents of user object and return it in the response
                    // Admins also have a unique cookie for accessing protected routes.          
                    accessTokenAdmin = jwt.sign(jwtPayload, process.env.JWT_KEY_ADMIN, { expiresIn: '1h' }); // 30 mins
                    accessToken = jwt.sign(jwtPayload, process.env.JWT_KEY, { expiresIn: '1h' }); // 30 mins
                    refreshToken = jwt.sign(jwtPayload, process.env.JWT_KEY_ADMIN_REFRESH, { expiresIn: '1d' }); // 24 hours
                } else {
                    accessToken = jwt.sign(jwtPayload, process.env.JWT_KEY, { expiresIn: '1h' }); // 30 mins
                    refreshToken = jwt.sign(jwtPayload, process.env.JWT_KEY_REFRESH, { expiresIn: '14d' }); // 14 days // Check for error
                }
            }
            catch (e) {
                res.json({ success: false, message:'failed to sign tokens!'});
            }

            if (accessTokenAdmin) {
                res.cookie('access_token_admin', accessTokenAdmin, { 
                    httpOnly: true,
                });
            }

            res.cookie('access_token', accessToken, { 
                httpOnly: true,
              });
            
            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
              });

            return res.json({ success: true ,message: 'Signed in successfully' });
        });
    })(req, res, next);
});


export default router;