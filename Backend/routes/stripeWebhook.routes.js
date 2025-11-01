import express from 'express' ;
import stripe from 'stripe' ;
import dotenv from 'dotenv' ;
import bodyParser from 'body-parser' ;
import { createSuperchatPaymentWebhook } from '../controllers/stripe.controller.js';

dotenv.config() ;

const router = express.Router() ;

router.post('/webhook' , 
  bodyParser.raw({ type: 'application/json' }) ,
  async(req , res , next) => {
    const sig = req.headers["stripe-signature"]
    console.log('success');
    
    let event ;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.WEBHOOK_KEY,
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.sendStatus(400);
    }
    
    if(event.type === 'payment_intent.succeeded'){
      console.log(event.data.object.metadata , event.type);
      let data = event.data.object;
      let metadata = data.metadata;
      req.metadata = metadata ;
      if(metadata.type === 'superchat'){
        return createSuperchatPaymentWebhook(req , res , next)
      }
    }
    return res.sendStatus(200)
  }
);

export default router ;