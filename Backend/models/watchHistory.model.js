import mongoose from "mongoose";

const watchHistorySchema = new mongoose.Schema({
  post : {
    type : mongoose.Types.ObjectId ,
    ref : 'post' ,
    required : true ,
  } ,
  user : {
    type : mongoose.Types.ObjectId ,
    ref : "user" ,
    required : true ,
    index : true ,
  } ,

  
} , {timestamps : true})

export const WatchHistory = mongoose.model('watchHistory' , watchHistorySchema)