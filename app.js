import 'dotenv/config';
import jwt from 'jsonwebtoken';
import express from 'express';
import mongoose from 'mongoose';
import logger from 'morgan';
import passport from 'passport';
import cors from 'cors';
import { createHttpError } from 'http-errors';

const app = express();

// Setting up mongo database
mongoose.set('strictQuery', false);

async function main() {
    await mongoose.connect(process.env.MONGO_URL);
}

main().catch(err => console.log('Mongo Connection error'));

// Global middleware
const corsOption = { // Change later.
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
  }
app.use(cors(corsOption));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(passport.initialize());


// Routers
app.get('/api', (req,res,next) => {
    res.json({
        body: "Welcome to the API"
    })
})


// Catching 404 and forwarding it to error handler
app.use(function(req,res,next) {1
    next(createHttpError(404));
});

app.listen(process.env.PORT, ()=> {
    console.log(`Listening at port ${process.env.PORT}`);
})
