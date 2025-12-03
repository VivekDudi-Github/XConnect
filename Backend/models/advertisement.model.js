import mongoose from "mongoose";

const advertisementSchema = new mongoose.Schema({
  posts : [{
    _id : {
      type : mongoose.Schema.Types.ObjectId ,
      ref : 'Post'
  } 
  }] ,
  comments : [{
    _id :{
      type : mongoose.Schema.Types.ObjectId ,
      ref : 'Comment'
  } 
  }] ,
  banner : [{
    _id : {
      type : mongoose.Schema.Types.ObjectId ,
      ref : 'AdBanner'
  } 
  }] ,
  price : {
    type : Number ,
    enum : [100 , 200 , 500 , 1000]
  } ,
  views : {
    type : Number ,
    default : 0 ,
  } ,
  tags : {
    type : [String] ,
    validate : (v) => v.length > 0 && v.length <= 10 ,
  } ,
  start_date : {
    type : Date ,
  } ,
  noTags : {
    type : Boolean ,
    default : false  
  } ,
  creator : {
    type : mongoose.Schema.Types.ObjectId ,
    ref : 'User' ,
    required : true ,
  }
} , {timestamps : true})

export const Advertisement  = mongoose.model('Advertisement' , advertisementSchema)