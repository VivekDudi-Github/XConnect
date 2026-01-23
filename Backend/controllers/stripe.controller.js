import { stripe } from "../utils/stripe.js";
import {LiveChat} from '../models/liveChats.model.js'
import {TryCatch , ResError , ResSuccess} from '../utils/extra.js'
import { io } from "../app.js";
import dotenv from 'dotenv' ;
import stripe from 'stripe' ;

dotenv.config() ;

const createSuperchatPayment = TryCatch( async (req, res) => {
    const { streamId, message, amount } = req.body;
    if(amount === 0) return ResError(res , 400 , 'Amount should be greater than 0')
    if(!streamId) return ResError(res , 400 , 'StreamId is required')
    if(!message?.trim()) return ResError(res , 400 , 'Message is required')

      
    const paymentIntent = await stripe.paymentIntents.create({
      payment_method_types : ['card'],
      amount: amount * 100, // paise
      currency: "inr",
      metadata: {
        type: "superchat",
        _id : req.user._id.toString() ,
        username : req.user.username ,
        avatar : req.user.avatar.url ,
        streamId ,
        message ,
        amount ,
      }
    })
    
    return ResSuccess(res , 200 , paymentIntent.client_secret)
} , 'PaymentIntent')


const receiveWebhook = TryCatch(async(req , res , next) => {
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
  } , 'webhook')

const createSuperchatPaymentWebhook = TryCatch(async(req , res) => {
  console.log('webHook Reached');
  
  const {_id , username , avatar , streamId , message , amount} = req.metadata ;
  if(amount === 0) return res.status(200) ;
  const superChat = await LiveChat.create({
    sender : _id , 
    message ,
    roomId : streamId ,
    isSuperChat : true ,
    amount : amount ,
  })
  io.to('liveStream:'+streamId).emit('RECEIVE_LIVE_MESSAGE' , {
    ...superChat._doc ,
    sender : {
      _id : _id , 
      username : username , 
      avatar : {url : avatar} ,
    }
  })
  return res.status(200) ;
} , 'PaymentIntentWebhook')

export { 
  createSuperchatPayment ,
  receiveWebhook
}