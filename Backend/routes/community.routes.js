import express from 'express';
import {checkUser} from '../utils/chekAuth.js'
import { uploadFiles } from '../middlewares/multer.js';

import * as routes from '../controllers/community/route.index.js'

const router = express.Router();

router.post('/create' , checkUser , uploadFiles , routes.CreateCommunity);

router.post('/follow/:id' , checkUser , routes.followCommunity);
router.get('/feed' , checkUser , routes.communityFeed);
router.get('/following' , checkUser , routes.getFollowingCommunities);
router.get('/posts/:id' , checkUser , routes.GetCommunityPosts);

router.post('/update/:id' , checkUser , uploadFiles , routes.updateCommunity);
router.get('/:id' , checkUser , routes.GetCommunity);

router.post('/invite-mods' , checkUser , routes.inviteMods) ;
router.get('/is-invited/:id' , checkUser , routes.getCommunityIsInvited) ; 
router.post('/toggleMode/:id' , checkUser , routes.toggleJoinMod) ;


export default router;