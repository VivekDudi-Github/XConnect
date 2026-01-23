import { uploadFiles} from "../middlewares/multer.js";
import express from "express";
import { checkUser } from "../utils/chekAuth.js";

import * as routes from '../controllers/post/routes.index.js'


const router = express.Router();
router.post('/' , checkUser , uploadFiles , routes.createPost);


router.get('/user/' , checkUser , routes.getUserPosts);
router.post('/toggle/:id' , checkUser , routes.toggleOnPost );
router.post('/increaseViews/:id' , checkUser , routes.increasePostViews );
router.get('/trending' , checkUser , routes.fetchExplorePost );

router.get('/me/feed/' , checkUser , routes.fetchFeedPost ) ;

router.get('/:id' , checkUser , routes.getPost);
router.patch('/:id' , checkUser , uploadFiles , routes.editPost); 
router.delete('/:id' , checkUser , routes.deletePost);



export default router;