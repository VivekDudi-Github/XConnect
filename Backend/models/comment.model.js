import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  post : {
    type : mongoose.Types.ObjectId ,
    ref : 'post' ,
    required : true ,
    index : true
  } ,
  replyTo : {
    type : String ,
    enum : ['post' , 'comment'] ,
    required : true ,
  } ,
  comment_id : {
    type : mongoose.Types.ObjectId ,
    ref : 'comment' ,
    index : true ,
    default : null ,
  } ,
  content : {
    type : String ,
  } ,
  mentions : [
    {
      type : String , 
      lowercase : true ,
      trim : true
    }
  ] ,
  isEdited : {
    type : Boolean ,
    required : true ,
  } ,
  user : {
    type : mongoose.Types.ObjectId ,
    ref : 'user' ,
    required : true ,
    index : true
  } ,
} , { timestamps : true})

export const Comment = mongoose.model('Comment' , commentSchema)