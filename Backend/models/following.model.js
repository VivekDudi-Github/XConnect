import mongoose from "mongoose";

const followingSchema = new mongoose.Schema({
  followedTo : {
    type : mongoose.Types.ObjectId ,
    required : true ,
    ref : 'User'
  } ,
  followedBy : {
    type : mongoose.Types.ObjectId ,
    required : true ,
    ref : 'User' 
  } ,

} , {timestamps : true})

export const Following = mongoose.model('following' , followingSchema)