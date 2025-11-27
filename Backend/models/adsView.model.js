import mongoose from "mongoose";

const adsViewSchema = new mongoose.Schema({
  user : {
    type : mongoose.Types.ObjectId ,
    ref : "User" ,
    required : true ,
    index : true ,
  } ,
  doc_id : {
    type : mongoose.Types.ObjectId ,
    required : true ,
  } ,
  type : {
    type : String ,
    enum : ['comment' , 'post' , 'banner' ]
  }
  
} , {timestamps : true})

export const AdsView = mongoose.model('adsView' , adsViewSchema)