import express from 'express' ;
import { checkUser } from '../utils/chekAuth.js';
import { createComment, deleteComment, getSingleComment , getComments, toggleLikeComment, toggleDislikeComment } from '../controllers/comment.controller.js';

const router = express.Router() ;

router.post('/:id' , checkUser , createComment) ;
router.get('/post/:id' , checkUser , getComments) ;

router.get('/:id' , checkUser , getSingleComment) ;

router.post('/like/:id' , checkUser , toggleLikeComment) ;
router.post('/dislike/:id' , checkUser , toggleDislikeComment) ;

router.delete('/:id' , checkUser , deleteComment) ;

export default router ;