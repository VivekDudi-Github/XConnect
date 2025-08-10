import express from 'express';
import {CheckUser} from '../utils/chekAuth.js'

import { CreateCommunity, GetCommunity, GetCommunityPosts , getFollowingCommunities  } from '../controllers/community.controller.js';


const router = express.Router();

router.post('/create' , CheckUser , CreateCommunity);

router.get('/following' , CheckUser , getFollowingCommunities);
router.get('/post/:id' , CheckUser , GetCommunityPosts);
router.get('/:id' , CheckUser , GetCommunity);



export default router;