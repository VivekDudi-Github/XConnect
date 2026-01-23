import express from 'express' ;
import bodyParser from 'body-parser' ;
import { stripeWebhookHandler } from '../controllers/payment/payment.webhook.js';

const router = express.Router() ;

router.post('/webhook' , 
  bodyParser.raw({ type: 'application/json' }) ,
  stripeWebhookHandler
);

export default router ;