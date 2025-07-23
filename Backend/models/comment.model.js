import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  post : {
    type : mongoose.Types.ObjectId ,
    ref : 'Post' ,
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
    ref : 'Comment' ,
    index : true ,
    default : null ,
  } ,
  content : {
    type : String ,
    required : true ,
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
    ref : 'User' ,
    required : true ,
    index : true
  } ,
} , { timestamps : true})

export const Comment = mongoose.model('Comment' , commentSchema)