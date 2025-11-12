import express from 'express'
import { search , searchUsers } from '../controllers/search.controller.js'
import {checkUser} from '../utils/chekAuth.js'

const router = express.Router()

router.get('/search' ,checkUser , search)
router.get('/searchUsers' , checkUser , searchUsers)

export default router