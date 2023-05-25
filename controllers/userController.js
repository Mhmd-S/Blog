import { body, validationResult } from 'express-validator';
import { verifyAdminJWT, verifyJWT } from '../authentication/jwtAuthentication';
import * as userService from '../services/userService';
import { AppError } from '../utils/errorHandler';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const getUser = [
    verifyJWT,
    async(req,res,next) => {
        try{
            const userId = req.params.userId;
            if(!userId) throw new AppError(400, 'Invalid :userId paramter');

            const user = await userService.getUser(userId);
            res.status(200).json({status: "OK", result: user });
        } catch(err) {
            next(err);
        }
    }
]

const addUser = [
    verifyAdminJWT,
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
    async(req,res,next)=>{
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) new AppError(400, errors.array());
            const userObj = {
                username: req.body.username,
                email: req.body.email,
                password:req.body.password
            }
            const newUser = await userService.addUser(userObj);
            res.status(200).json({ status: "OK", result: newUser })
        } catch(err) {
            console.log(err);
            next(err)
        }
    }
]

const deleteUser = [
    verifyAdminJWT, 
    (req,res,next) => {
        try{
        const userId = req.params.userId;
        if(!userId) throw new AppError(400, 'Invalid :userId paramter');

        const result = userService.deleteUser(userId);
        res.status(200).json({status:"OK", result: result });
        } catch(err) {
            next(err);
        }
    }
]

const signInUser = (req, res, next)  => {
    try{
        passport.authenticate('local', {session: false}, (err, user, info) => {
            if (err || !user) {
                 throw new AppError(500, err ? err : "Server failed to log in the user")
            }
        
            req.login(user, { session: false }, (err) => {
                if (err) {
                    throw new AppError(400, err);
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
                catch (err) {
                    throw new AppError(500, "Error in generating tokens");
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
    
                return res.status(200).json({ status: "OK" , result: 'Signed in successfully. Tokens sent.' });
            });
        })(req, res, next);
    } catch(err) {
        next(err);
    }

    }

export { getUser, addUser, deleteUser, signInUser };