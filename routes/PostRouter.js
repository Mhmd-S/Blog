import express from 'express';
import Post from '../models/PostModel';
import { body, validationResult } from 'express-validator';
import { verifyJWT, verifyAdminJWT } from '../passport';
import Comment from '../models/CommentsModel'

let router = express.Router();

// Get all a certain amount of posts
router.get('/list/:amount', verifyJWT, async (req,res,next) => {
    Post.find({})
        .then(posts => {
            res.status(200).json({ success:true, posts: posts })
        })
        .catch(e => {
            res.status(500).json({ success:false, message: 'Databse not responsive'})
        });
} );


// Get a certain post using its id
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


// Create a post
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
                    author: req.userId, // Recieved when verifying the cookies
                    date: new Date(),
                    lastUpadate: new Date()
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

// Update a post
router.put('/:postId',
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

                Post.updateOne({ _id: req.params.postId  }, { 
                    title: req.body.title,
                    content: req.body.content,
                    author: req.userId,
                    lastUpdate: new Date()
                })
                .then(()=>{
                    res.status(200).json({ success: true, message:'Post updated successfully'})
                })
                .catch(e=> {
                    res.status(501).json({ success: false, message:'Could not update post'})
                })
            }
)

// Delete a post
router.delete('/:postId', 
            verifyAdminJWT,
            (req,res,next) => {
                Post.deleteOne({ _id : req.params.postId })
                .then(()=>{
                    res.status(200).json({ success: true, message: 'Post deleted successfully'})
                })
                .catch(e => {
                    res.status(501).json({ success: false, message: 'Could not delete post'})
                })
            }
)

// Post comments

router.get('/:postId/comments', 
            verifyJWT,
            (req,res,next) => {
                Post.findById( req.params.postId ).populate('comments').exec()
                .then((comments)=>{
                    res.status(200).json({ success: true, message : comments })
                })
                .catch(e => {
                    res.status(501).json({ success: false, message: 'Could not get comments'})
                })
            
})

router.put('/:postId/comments/add-comment', 
            verifyJWT,
            body('content')
            .trim()
            .isLength({ min:1, max: 300 }).withMessage('Comments can have a minimum of 1 character and maximum if 300 characters')
            .escape(),
            (req,res,next) => {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({ success: false, message: errors })
                    return;
                }

                const newComment = new Comment({
                    author: req.userId,
                    content: req.body.content,
                    date: new Date(),
                    post: req.params.id
                })

                newComment.save()
                    .then((result)=>{
                        console.log(result)
                        Post.updateOne({ _id: req.params.postId },
                                       {$push: {comments:  result._id}
                        })
                        .then(()=>{
                            res.status(200).json({ success: true, message: 'Comment added successfully'})
                        })
                        .catch(e => {
                            console.log(e);
                            res.status(501).json({ success: false, message: 'Could not add comment'})
                            return;
                        })
                    })
                    .catch(e => {
                        console.log(e);
                        res.status(501).json({ success: false, message: 'Could not add comment'})
                        return;
                    })
            }
            )  

export default router;