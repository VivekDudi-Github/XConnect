import express from 'express' ;
import {checkUser} from '../utils/chekAuth'
import { createAdCampaign } from '../controllers/advertisement.controller';

const router = express.Router() ;

router.post('/ad/campaign/create/' , checkUser , createAdCampaign)


export default router ;