import express from 'express' ;
import { checkUser } from '../utils/chekAuth.js';
import { createComment } from '../controllers/comment.controller.js';

const router = express.Router() ;

router.post('/:id' , checkUser , createComment)


export default router ;