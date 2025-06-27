import express from 'express' ;
import { checkUser } from '../utils/chekAuth.js';
import { createComment, deleteComment, getComments, toggleLikeComment } from '../controllers/comment.controller.js';

const router = express.Router() ;

router.post('/:id' , checkUser , createComment) ;
router.get('/:id' , checkUser , getComments) ;

router.post('/like/:id' , checkUser , toggleLikeComment) ;
router.delete('/:id' , checkUser , deleteComment) ;

export default router ;