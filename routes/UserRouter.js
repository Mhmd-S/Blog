import express from 'express';

import '../authentication/passport'; // Imports the strategies that will be used by passport
import * as userController from '../controllers/userController';

let router = express.Router();

router.get('/:userId', userController.getUser );

router.post('/', userController.addUser );

router.delete('/:userId', userController.deleteUser);

// Using the local strategy we authenticate the user. If the auth is successfull we generate a token and send it to the user
router.post('/sign-in', userController.signInUser );


export default router;