import express from 'express' ;
import {checkUser} from '../utils/chekAuth.js'
import { getAnalyticsPage } from '../controllers/analytics/analytics.controller.js';

const router = express.Router() ;

router.get('/home/' , checkUser , getAnalyticsPage)

export default router ;