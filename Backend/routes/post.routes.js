import { uploadFiles} from "../middlewares/multer.js";
import express from "express";
import { checkUser } from "../utils/chekAuth.js";
import { createPost, deletePost, editPost, fetchFeedPost, getUserPosts, getPost, toggleOnPost } from "../controllers/post.controller.js";

const router = express.Router();
router.post('/' , checkUser , uploadFiles , createPost);


router.get('/user/' , checkUser , getUserPosts);
router.post('/toggle/:id' , checkUser , toggleOnPost );

router.get('/me/feed/' , checkUser , fetchFeedPost )


router.get('/:id' , checkUser , getPost);


router.patch('/:id' , checkUser , uploadFiles , editPost); 
router.delete('/:id' , checkUser , deletePost);



export default router;