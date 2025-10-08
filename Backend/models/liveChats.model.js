import mongoose from "mongoose";

const liveChatSchema = new mongoose.Schema({  
  message : {
    type : String ,
    required : true
  } ,
  sender : {
    type : mongoose.Schema.Types.ObjectId ,
    ref : 'User' ,
    required : true
  } ,
  roomId : {
    type : mongoose.Types.ObjectId ,
    ref : "LiveStream"
  } ,
  isSuperChat : {
    type : Boolean ,
    default : false ,
  } , 
  amount : {
    type : Number ,
    default : 0 ,
  }
} , {timestamps : true} )

export const liveChat = mongoose.model('liveChat' , liveChatSchema)