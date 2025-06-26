import express from 'express' ;
import { checkUser } from '../utils/chekAuth.js';
import { createComment, getComment } from '../controllers/comment.controller.js';

const router = express.Router() ;

router.post('/:id' , checkUser , createComment)
router.get('/:id' , checkUser , getComment)

export default router ;