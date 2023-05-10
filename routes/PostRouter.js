import express from 'express';
import passport from 'passport';
import Post from '../models/PostModel';
import { body, validationResult } from 'express-validator';
import { verifyJWT, verifyAdminJWT } from '../passport';

let router = express.Router();

router.get('/list/:amount', verifyJWT, async (req,res,next) => {
    Post.find({})
        .then(posts => {
            res.status(200).json({ success:true, posts: posts })
        })
        .catch(e => {
            res.status(500).json({ success:false, message: 'Databse not responsive'})
        });
} );

router.get('/:postId', verifyJWT, (req,res,next) => {
    const postId = req.params.postId;

    Post.findOne({ _id: postId }).exec()
        .then(postInfo => {
            res.status(200).json({ post : postInfo })
        })
        .catch(e => {
            res.status(400).json({ error: 'Could not get post'})
        });
    }
);

router.post('/add-post', 
            verifyAdminJWT,
            body('title')
            .trim()
            .not().isEmpty().withMessage('Title can not be empty!')
            .escape(),
            body('content')
            .trim()
            .isLength({ min:1, max: 1250 }).withMessage('Content size should be atleast 1 character and a maximum of 1250')
            .escape(),
            (req,res,next) => {
            
                const errors = validationResult(req);

                if ( !errors.isEmpty() ) {
                    res.status(400).json({ error: errors.array() })
                    return;
                }

                const postInfo = new Post({
                    title: req.body.title,
                    content: req.body.content,
                    author: req.user._id,
                    date: new Date()
                }) 

                postInfo.save()
                    .then(()=>{
                        res.status(200).json({ status: 'success' });
                    })
                    .catch((e)=>{
                        res.status(400).json({ error: e});
                    })
            }
    )

export default router;