import mongoose from "mongoose";

const watchHistorySchema = new mongoose.Schema({
  post : {
    type : mongoose.Types.ObjectId ,
    ref : 'Post' ,
    required : true ,
    index : true ,
  } ,
  author : {
    type : mongoose.Types.ObjectId ,
    ref : 'User' , 
    required : true ,
    index : true ,
  } ,
  user : {
    type : mongoose.Types.ObjectId ,
    ref : "User" ,
    required : true ,
    index : true ,
  } ,
} , {timestamps : true})
watchHistorySchema.index({createdAt : 1})

export const WatchHistory = mongoose.model('watchHistory' , watchHistorySchema)