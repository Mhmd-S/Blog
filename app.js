import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import createHttpError from 'http-errors';
import User from './models/UserModel';
import passport from 'passport';


import userRouter from './routes/UserRouter';
import postRouter from './routes/PostRouter';
import authRouter from './routes/AuthRouter';


const app = express();

// Setting up mongo database
mongoose.set('strictQuery', false);

async function main() {
    await mongoose.connect(process.env.MONGO_URL);
}

main().catch(err => console.log('Mongo Connection error'));

// Configs for the global middleware
const corsOption = { // Change later. // Config for the CORS
    'origin': '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false,
    'optionsSuccessStatus': 204
  }

// Global middleware
app.use(cors(corsOption));
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(passport.initialize());

// Routers
app.use('/users', userRouter);
app.use('/posts', postRouter);
app.use('/auth', authRouter);

// Catching 404 and forwarding it to error handler
app.use(function(req,res,next) {
    next(createHttpError(404));
});

app.use(function (err,req,res,next) {
    // set locals, only providing error in dev
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') == 'development' ? err : {};

    // render error page
    res.status(err.status || 500);
    res.json({error: err.message});
});

app.listen(process.env.PORT, ()=> {
    console.log(`Listening at port ${process.env.PORT}`);
})
