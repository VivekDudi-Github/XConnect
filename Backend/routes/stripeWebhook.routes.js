import express from 'express' ;
import stripe from 'stripe' ;
import dotenv from 'dotenv' ;
import bodyParser from 'body-parser' ;
import { createSuperchatPaymentWebhook } from '../controllers/stripe.controller.js';

dotenv.config() ;

const stripeWebhook = express.Router() ;

stripeWebhook.post('/' , 
  bodyParser.raw({type : 'application/json'})  , 
  async(req , res , next) => {
    const sig = req.headers["stripe-signature"]

    let event ;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.WEBHOOK_KEY
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.sendStatus(400);
    }

    if(event.type === 'payment_intent.succeeded'){
      let data = event.data.object;
      let metadata = data.metadata;
      req.metadata = metadata ;
      if(metadata.type === 'superchat'){
        return createSuperchatPaymentWebhook(req , res , next)
      }
    }
    return res.status(200)
  }
);

export default stripeWebhook ;