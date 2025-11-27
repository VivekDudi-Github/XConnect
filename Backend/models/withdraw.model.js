import mongoose from "mongoose";

const withdrawSchema = new mongoose.Schema({
  user : {
    type : mongoose.Types.ObjectId ,
    ref : "User" ,
    required : true ,
    index : true ,
  } ,
  amount : {
    type : Number ,
    required : true ,
  } ,
  
} , {timestamps : true})

export const Withdraw = mongoose.model('withdraw' , withdrawSchema)