import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  name : {
    type : String ,
    required : true ,
  } ,
  avatar : {
    url : {
      type : String ,
      required : true ,
    } , 
    public_id : {
      type : String , 
      required : true ,
    } ,
  } ,
  banner : {
    url : {
      type : String ,
      required : true ,
    } , 
    public_id : {
      type : String , 
      required : true ,
    } ,
  } ,
  description : {
    type : String ,
    required : true ,
  } , 
  creator : {
    type : mongoose.Types.ObjectId ,
    ref : 'User' ,
    required : true ,
  } ,
  admins : [
    {
      type : mongoose.Types.ObjectId ,
      ref : 'User' ,
      required : true ,
    }
  ] ,
  followers : {
    type : Number ,
    default : 0 ,
  } ,
  rules: {
    type : String ,
    required : true  
   } ,
  highlights: [{ 
    type: mongoose.Types.ObjectId,
    ref: 'Post' ,
    unique : true 
  }] ,
  tags : [
    {
      type : String , 
      lowercase : true , 
      trim : true , 
      index : true  ,
    }
  ]

} , {timestamps : true})


export const Community = mongoose.model('Community' , communitySchema)
