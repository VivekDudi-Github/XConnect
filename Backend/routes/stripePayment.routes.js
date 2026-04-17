import express from 'express' ;
import { createSuperchatPayment } from '../modules/payment/payment.controller.js';
import { checkUser } from '../utils/checkAuth.js';

const router = express.Router() ;

router.post('/superchat/create' , checkUser , createSuperchatPayment )

export default router ;