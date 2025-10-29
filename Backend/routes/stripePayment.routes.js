import express from 'express' ;
import { createSuperchatPayment } from '../controllers/stripe.controller.js';
import { checkUser } from '../utils/chekAuth.js';

const router = express.Router() ;

router.post('/superchat/create' , checkUser , createSuperchatPayment )

export default router ;