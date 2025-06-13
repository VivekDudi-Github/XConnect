import { uploadFiles} from "../middlewares/multer.js";
import express from "express";
import { checkUser } from "../utils/chekAuth.js";
import { createPost, deletePost, editPost, getPost } from "../controllers/post.controller.js";

const router = express.Router();

router.get('/:id' , checkUser , getPost);
router.post('/' , checkUser , uploadFiles , createPost);
router.patch('/:id' , checkUser , uploadFiles , editPost); 
router.delete('/:id' , checkUser , deletePost);

export default router;