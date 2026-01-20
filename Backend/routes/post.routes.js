import { uploadFiles} from "../middlewares/multer.js";
import express from "express";
import { checkUser } from "../utils/chekAuth.js";


import { createPost } from "../controllers/post/controller/createPost.controller.js";
import { deletePost } from "../controllers/post/controller/deletePost.controller.js"
import { editPost } from "../controllers/post/controller/editPost.controller.js";
import { toggleOnPost , increasePostViews } from "../controllers/post/controller/toggleOnPost.controller.js";
import { getPost } from "../controllers/post/controller/getPost.contorller.js";
import { getUserPosts } from "../controllers/post/controller/getUserPosts.controller.js";
import { fetchFeedPost } from "../controllers/post/controller/fetchFeedPosts.controller.js";
import { fetchExplorePost  } from "../controllers/post/controller/explore.controller.js"; 

const router = express.Router();
router.post('/' , checkUser , uploadFiles , createPost);


router.get('/user/' , checkUser , getUserPosts);
router.post('/toggle/:id' , checkUser , toggleOnPost );
router.post('/increaseViews/:id' , checkUser , increasePostViews );
router.get('/trending' , checkUser , fetchExplorePost );

router.get('/me/feed/' , checkUser , fetchFeedPost )

router.get('/:id' , checkUser , getPost);
router.patch('/:id' , checkUser , uploadFiles , editPost); 
router.delete('/:id' , checkUser , deletePost);



export default router;