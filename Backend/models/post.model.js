import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
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
    {
    _id : false ,
    url : {
      type : String ,
      required : true ,
    } , 
    public_id : {
      type : String , 
      required : true ,
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
    index: true
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
  isEdited : {
    type : Boolean ,
    default : false
  } ,
  isPinned : {
    type : Boolean ,
    default : false
  }
} , {timestamps : true})

postSchema.query.NoDelete = function() {
  return this.where({ isDeleted : false})
}


export const Post = mongoose.model("Post", postSchema);