import express from 'express'
import { searchBarsearch, searchUsers , normalSearch, continueSearch } from '../controllers/search.controller.js'
import {checkUser} from '../utils/chekAuth.js'

const router = express.Router()

router.post('/searchbar' ,checkUser , searchBarsearch) ;
router.post('/searchPosts', checkUser , normalSearch) ;

router.post('/continue' , checkUser , continueSearch)

router.get('/searchUsers' , checkUser , searchUsers)

export default router