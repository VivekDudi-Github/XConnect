import mongoose from "mongoose";

const watchHistorySchema = new mongoose.Schema({
  post : {
    type : mongoose.Types.ObjectId ,
    ref : 'Post' ,
    required : true ,
  } ,
  user : {
    type : mongoose.Types.ObjectId ,
    ref : "User" ,
    required : true ,
    index : true ,
  } ,

  
} , {timestamps : true})

export const WatchHistory = mongoose.model('watchHistory' , watchHistorySchema)