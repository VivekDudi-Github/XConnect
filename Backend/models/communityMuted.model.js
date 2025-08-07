import mongoose from "mongoose";

const communityMutedSchema = new mongoose.Schema({
  user : {
    type : mongoose.Types.ObjectId ,
    ref : 'User' ,
    required : true ,
  } ,
  community : {
    type : mongoose.Types.ObjectId ,
    ref : 'Community' ,
    required : true ,
  } ,
  createdAt : {
    type : Date ,
    default : Date.now ,
  } , 
  expiresAt : {
    type : Date ,
    default : Date.now ,
  } ,
} , {timestamps : true})

export const CommunityMuted = mongoose.model('CommunityMuted' , communityMutedSchema)