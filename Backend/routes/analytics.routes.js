import express from 'express' ;
import {checkUser} from '../utils/checkAuth.js'
import { getAnalyticsPage } from '../modules/analytics/analytics.controller.js';

const router = express.Router() ;

router.get('/home/' , checkUser , getAnalyticsPage)

export default router ;