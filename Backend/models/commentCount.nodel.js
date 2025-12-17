import mongoose from 'mongoose'

const commentCountSchema = new mongoose.Schema({
  user : {
    type : mongoose.Types.ObjectId ,
    ref : 'Post' ,
    required : true ,
  } ,
  count : {
    type : Number ,
    default : 0 ,
    required : true ,
  } ,
} , { timestamps : true})
commentCountSchema.index({user : 1 , createdAt : 1})

export const CommentCount = mongoose.model('CommentCount' , commentCountSchema)