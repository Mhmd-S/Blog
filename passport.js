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
                return done(null, false, { message: 'Incorrect Username' });
            }
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                  // passwords match! log user in
                  return done(null, user)
                } else {
                  // passwords do not match!
                  return done(null, false, { message: 'Incorrect password' })
                }
            })
        } catch(e) {
            return done(e);
        }
    })
);

const cookieExtractor = (req) => {
    if (req && req.cookies ) {
        const token = req.cookies.access_token; 
        return token; 
    }  
}

const authenticateRequestCookie = (req,res,next) => {
    const token = cookieExtractor(req);
    console.log(Date.now())
    const result = jwt.verify(token, process.env.JWT_KEY);
    console.log(result);
    next();
}

export { authenticateRequestCookie };

// const opts = {
//     jwtFromRequest: cookieExtractor,
//     secretOrKey: process.env.JWT_KEY
// };

// passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
//     User.findOne({ id: jwt_payload.sub }).exec()
//         .then(user => {
//             if (user) {
//                 done(null, user);
//             } else {
//                 done(null, false);
//             }
//         })
//         .catch(err => {
//             return done(err,false)
//         });
// }));