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
    index : true 
  } ,
  content : {
    type : String ,
  } ,
  media : [
    {
      type : {
        type : String ,
        required : true 
      } ,
      url : {
        type : String ,
        required : true 
      } ,
      public_id : {
        type : String ,
        required : true ,
      }
    } ,
  ] ,
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
  }
} , { timestamps : true})

export const Comment = mongoose.model('Comment' , commentSchema)