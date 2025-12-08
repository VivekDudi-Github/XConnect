import express from 'express'
import { searchBarsearch, searchUsers } from '../controllers/search.controller.js'
import {checkUser} from '../utils/chekAuth.js'

const router = express.Router()

router.post('/searchbar' ,checkUser , searchBarsearch)
router.get('/searchUsers' , checkUser , searchUsers)

export default router