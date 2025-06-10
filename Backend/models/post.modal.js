import mongoose  from 'mongoose'

const postSchema = mongoose.Schema({
  sender : {
    type : mongoose.Types.ObjectId ,
    ref : "User" ,
    required : true
  } , 
  attachments : [
    {type : String}
  ] ,
  
} , {timestamps : true})