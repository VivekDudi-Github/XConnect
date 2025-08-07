import mongoose from "mongoose";

const followingSchema = new mongoose.Schema({
  followedTo : {
    type : mongoose.Types.ObjectId ,
    ref : 'User' ,
    index : true ,
  } ,
  followedBy : {
    type : mongoose.Types.ObjectId ,
    required : true ,
    ref : 'User' ,
    index : true ,
  } ,
  followingCommunity : {
    type : mongoose.Types.ObjectId ,
    ref : 'Community' ,
    index : true ,
  }

} , {timestamps : true})

export const Following = mongoose.model('following' , followingSchema)