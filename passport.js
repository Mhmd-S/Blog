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
            return done(null,user);
        } catch(e) {
            return done(e);
        }
    })
);

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_KEY
};


passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    User.findOne({id: jwt_payload.sub}).exec()
        .then(user => {
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch(err => {
            return done(err,false)
        });
}));