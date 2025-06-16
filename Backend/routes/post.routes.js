import { uploadFiles} from "../middlewares/multer.js";
import express from "express";
import { checkUser } from "../utils/chekAuth.js";
import { createPost, deletePost, editPost, getMyPosts, getPost, toggleLikePost } from "../controllers/post.controller.js";

const router = express.Router();

router.get('/:id' , checkUser , getPost);
router.post('/' , checkUser , uploadFiles , createPost);
router.patch('/:id' , checkUser , uploadFiles , editPost); 
router.delete('/:id' , checkUser , deletePost);

router.get('/me/posts' , checkUser , getMyPosts);
router.post('/like/:id' , checkUser , toggleLikePost );

export default router;