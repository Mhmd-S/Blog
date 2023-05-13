import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import User from './models/UserModel';

// Setting up passport login
passport.use(
    new LocalStrategy({ usernameField: 'email' },async (username, password, done) => {
        try {
            const user = await User.findOne({ email: username });
            if(!user) {
                return done({ message: 'Incorrect email' }, false );
            }
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                  // passwords match! log user in
                  return done(null, user)
                } else {
                  // passwords do not match!
                  return done({ message: 'Incorrect password' }, false)
                }
            })
        } catch(e) {
            return done(e);
        }
    })
);

// Not passport. But is used to to verify the user
// If adming is true then get the access_token_admin otherwise get the normal access_token
const cookieExtractor = (req, admin) => {
    if (req && req.cookies ) {
        const token = admin ? req.cookies.access_token_admin : req.cookies.access_token;
        return token; 
    }  
}

// Middleware for authenticating user
const verifyJWT = (req,res,next) => {
    const accessToken = cookieExtractor(req, false)
    jwt.verify(accessToken, process.env.JWT_KEY,(err, decoded) => {
        if (err) {
            console.log(accessToken)
            res.status(401).json({success: false, message: 'Toking invalid!'});
            return;
        }
        req.userId = decoded._id;
        next();
    });
}

// Middleware for authenticating admins
// Whenever the admins are sending a request a protected route they need to sned their admin cookie as the access_token
const verifyAdminJWT = (req,res,next) => { 
    const accessToken = cookieExtractor(req, true);
    jwt.verify(accessToken, process.env.JWT_KEY_ADMIN, (err, decoded) => {
        if (err) {
            res.status(401).json({ success: false, message: 'Toking invalid!' });
            return;
        }
        req.userId = decoded._id;
        next();
    });
}

export { cookieExtractor, verifyJWT, verifyAdminJWT };