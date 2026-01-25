import express from 'express' ;
import { checkUser } from '../utils/chekAuth.js';
import * as routes from '../controllers/comment/comment.controller.js';

const router = express.Router() ;

router.post('/:id' , checkUser , routes.createComment) ;
router.get('/post/:id' , checkUser , routes.getComments) ;

router.get('/:id' , checkUser , routes.getAComment) ;

router.post('/like/:id' , checkUser , routes.toggleLikeComment) ;
router.post('/dislike/:id' , checkUser , routes.toggleDislikeComment) ;

router.delete('/:id' , checkUser , routes.deleteComment) ;

export default router ;