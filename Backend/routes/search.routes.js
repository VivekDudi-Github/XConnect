import express from 'express'
import { searchBarSearch, searchUsers , normalSearch, continueSearch } from '../controllers/search/search.controller.js'
import {checkUser} from '../utils/chekAuth.js'

const router = express.Router()

router.post('/searchbar' ,checkUser , searchBarSearch) ;
router.post('/n', checkUser , normalSearch) ;

router.get('/continue' , checkUser , continueSearch)

router.get('/searchUsers' , checkUser , searchUsers)

export default router ;