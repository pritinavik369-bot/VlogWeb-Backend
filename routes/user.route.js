import express from 'express'
import { test ,  updateUser , signout , getUser , deleteUser , getCommentedUser , ContactMe } from '../controllers/user.controller.js';
import verifyUser from '../utils/verifyUser.js';

const router = express.Router();
router.get('/test' , test);
router.put('/update/:userId', verifyUser, updateUser);
router.post('/signout', signout);
router.delete('/delete/:userId' , verifyUser , deleteUser);
router.get('/getusers',verifyUser, getUser);
router.post('/contact',verifyUser , ContactMe)

router.get('/:userId' , getCommentedUser);

  export default router;
  
