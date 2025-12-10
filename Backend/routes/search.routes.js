import express from 'express'
import { searchBarsearch, searchUsers , continueSearchCommunities , continueSearchPosts , continueSearchUsers, normalSearch } from '../controllers/search.controller.js'
import {checkUser} from '../utils/chekAuth.js'

const router = express.Router()

router.post('/searchbar' ,checkUser , searchBarsearch) ;
router.post('/searchPosts', checkUser , normalSearch) ;

router.get('/continue/posts' , checkUser , continueSearchPosts) ;
router.get('/continue/users' , checkUser , continueSearchUsers) ;
router.get('/continue/communities' , checkUser , continueSearchCommunities) ;

router.get('/searchUsers' , checkUser , searchUsers)

export default router