import mongoose from "mongoose";

const watchHistorySchema = new mongoose.Schema({
  post : {
    type : mongoose.Types.ObjectId ,
    ref : 'post' ,
  } ,
  user : {
    type : mongoose.Types.ObjectId ,
    ref : "user" ,
    required : true ,
    index : true ,
  } ,

  
} , {timestamps : true})