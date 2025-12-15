import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema({
  user : {
    type : mongoose.Schema.Types.ObjectId ,
    ref : 'User' ,
    required : true ,
  } ,
  amount : {
    type : Number ,
    required : true ,
  } ,
  createdAt : {
    type : Date ,
    required : true ,
    index : true ,
  } 
} , {timestamps : true})

export const Payout = mongoose.model('Payout' , payoutSchema)