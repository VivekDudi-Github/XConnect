import express from 'express' ;
import { createSuperchatPayment } from '../controllers/stripe.controller.js';

const router = express.Router() ;

router.post('/create-superchat-payment' , createSuperchatPayment )

export default router ;