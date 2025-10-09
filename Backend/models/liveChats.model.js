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
    ref : "LiveStream" ,
    index : true ,
    required : true ,
  } ,
  isSuperChat : {
    type : Boolean ,
    default : false ,
    index : true ,
  } , 
  amount : {
    type : Number ,
    default : 0 ,
  }
} , {timestamps : true} )

export const LiveChat = mongoose.model('LiveChat' , liveChatSchema)