import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  content : {
    type : String ,
    maxlength : 280 ,
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
  hashtags : [
    {
      type : String , 
      lowercase : true ,
      trim : true , 
      index : true ,
    }
  ] ,
  mentions : [
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
  likeCount : {
    type : Number ,
    default : 0 ,
  } ,
  shareCount : {
    type : Number ,
    default : 0 
  } ,
  commentCount : {
    type : Number ,
    default : 0 ,
  } ,
  author : {
    type : mongoose.Types.ObjectId ,
    ref : "User" ,
    required : true ,
    index : true
  } , 
  repost : {
    type : String ,
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