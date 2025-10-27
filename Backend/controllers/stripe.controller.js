import { stripe } from "../utils/stripe.js";
import {LiveChat} from '../models/liveChats.model.js'
import {TryCatch , ResError , ResSuccess} from '../utils/extra.js'
import { io } from "../app.js";

const createSuperchatPayment = TryCatch( async (req, res) => {
    const { senderId, streamId, message, amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // paise
      currency: "inr",
      metadata: {
        type: "superchat",
        sender : {
          _id : senderId ,
          username : req.user.username ,
          avatar : req.user.avatar ,
        },
        streamId,
        message ,
        amount ,
      }
    })

    return ResSuccess(res , 200 , paymentIntent.client_secret)
} , 'PaymentIntent')


const createSuperchatPaymentWebhook = TryCatch(async(req , res) => {
  const {sender , streamId , message , amount} = req.metadata ;
  if(amount === 0) return res.status(200) ;
  const superChat = await LiveChat.create({
    sender : sender._id , 
    message ,
    roomId : streamId ,
    isSuperChat : true ,
    amount : amount ,
  })
  io.to('liveStream:'+streamId).emit('RECEIVE_SUPERCHAT_MESSAGE' , {
    ...superChat._doc ,
    sender : {
      _id : sender._id , 
      username : sender.username , 
      avatar : sender.avatar
    }
  })
  return res.status(200) ;
} , 'PaymentIntentWebhook')

export { 
  createSuperchatPayment ,
  createSuperchatPaymentWebhook ,
}