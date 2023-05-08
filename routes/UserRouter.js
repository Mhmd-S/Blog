import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/UserModel';
import { body, validationResult } from 'express-validator';
import passport from 'passport';
import jwt from 'jsonwebtoken';


import '../passport'; // Imports the strategies that will be used by passport
import { authenticateRequestCookie } from '../passport';

let router = express.Router();

router.get('/:userId', 
    authenticateRequestCookie, 
    (req,res,next) => {
        // Fetch the user information from mongo using the id
        User.findOne({ _id: req.params.userId})
        .then(userInfo => {
            res.status(200).json({
                username: userInfo.username,
                _id: userInfo._id
            })
        })
        .catch(e => {
            res.status(400).json({ error: 'User could not be found' });
        });
    }
);

router.post('/add-user',
    passport.authenticate('jwt', { session : false }),
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
                .then(() => {
                    res.json({message: 'User created succesfully'});    
                })
                .catch((err)=> {
                    res.status(400).json({message: 'Could not create user'})
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
                error: 'Something is not right'
            });
        }
    
        req.login(user, { session: false }, (err) => {
            if (err) {
                return res.status(400).json({error: err});
            }     

            // JWT payload 
            const jwtPayload = {
                _id: user._id,
                emial: user.email
            }

        // generate a signed son web token with the contents of user object and return it in the response  
            const accessToken = jwt.sign(jwtPayload, process.env.JWT_KEY, { expiresIn: 30 * 60 }); // 30 mins
            const refreshToken = jwt.sign(jwtPayload, process.env.JWT_KEY_REFRESH, { expiresIn: 14 * 24 * 60 * 60 }); // 14 days

            res.cookie('access_token', accessToken, {
                httpOnly: true,
                secure: true,
                // maxAge: 30 * 60 * 1000 // 30 minutes in milliseconds
              });
            
            res.cookie('refresh_token', refreshToken, { // check the cookie
                httpOnly: true,
                secure: true,
                // maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days in milliseconds
              });

            return res.json({ message: 'Signed in successfully' });
        });
    })(req, res, next);
});


export default router;