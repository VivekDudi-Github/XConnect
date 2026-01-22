import express from 'express';
import {checkUser} from '../utils/chekAuth.js'

import { uploadFiles } from '../middlewares/multer.js';


import { CreateCommunity } from '../controllers/community/controller/createCommunity.controller.js'
import { GetCommunity } from '../controllers/community/controller/getCommunity.controller.js'
import { updateCommunity } from '../controllers/community/controller/updateCommunity.controller.js'
import { inviteMods , getCommunityIsInvited , toggleJoinMod } from '../controllers/community/controller/communityModeration.controller.js'
import { getFollowingCommunities } from '../controllers/community/controller/followCommunity.controller.js'
import { GetCommunityPosts } from '../controllers/community/controller/communityPost.controller.js';
import { followCommunity } from '../controllers/community/controller/followCommunity.controller.js';
import { communityFeed } from '../controllers/community/controller/communityFeed.controller.js';


const router = express.Router();

router.post('/create' , checkUser , uploadFiles , CreateCommunity);

router.post('/follow/:id' , checkUser , followCommunity);
router.get('/feed' , checkUser , communityFeed);
router.get('/following' , checkUser , getFollowingCommunities);
router.get('/posts/:id' , checkUser , GetCommunityPosts);

router.post('/update/:id' , checkUser , uploadFiles , updateCommunity);
router.get('/:id' , checkUser , GetCommunity);

router.post('/invite-mods' , checkUser , inviteMods) ;
router.get('/is-invited/:id' , checkUser , getCommunityIsInvited) ; 
router.post('/toggleMode/:id' , checkUser , toggleJoinMod)


export default router;