import express from 'express';
let router = express.Router();

router.get('/:postId', 
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

// change it to comments/postId/commentId etc what do u thin?

router.put('/:postId/add-comment', 
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
                    post: req.params.postId
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