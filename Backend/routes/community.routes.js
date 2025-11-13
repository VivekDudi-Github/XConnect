import express from 'express';
import {checkUser} from '../utils/chekAuth.js'

import { communityFeed, CreateCommunity, GetCommunity, GetCommunityPosts , getFollowingCommunities, followCommunity, updateCommunity, inviteMods, getCommunityIsInvited, toggleJoinMod  } from '../controllers/community.controller.js';
import { uploadFiles } from '../middlewares/multer.js';


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