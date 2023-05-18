import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import User from '../models/UserModel';

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
