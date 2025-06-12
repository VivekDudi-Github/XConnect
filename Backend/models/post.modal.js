import mongoose  from 'mongoose'

const postSchema = mongoose.Schema({
  author : {
    type : mongoose.Types.ObjectId ,
    ref : "User" ,
    required : true ,
    index : true
  } , 
  content : {
    type : String ,
    maxlenght : 280 ,
  } ,
  media : [
    {url : {
      type : String ,
      required : true
    } , 
     type : {
      type : String , 
      enum : ['image' , 'video'] ,
      required : true
     } 
    }
  ] ,
  hastags : [
    {
      type : String , 
      lowercase : true ,
      trim : true
    }
  ] ,
  isDeleted: {
    type: Boolean,
    default: false,
  },
  repost : {
    type : mongoose.Types.ObjectId ,
    ref : 'Post' ,
    default : null ,
  } ,
  visiblity : {
    type : String ,
    enum : ['public' ,'followers' ,'group' ] ,
    default : 'public' ,
    required : true ,
  } ,
  isPinned : {
    type : Boolean ,
    default : false
  }
} , {timestamps : true})

export const Post = mongoose.model("Post", postSchema);