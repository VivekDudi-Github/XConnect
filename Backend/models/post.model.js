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
  author : {
    type : mongoose.Types.ObjectId ,
    ref : "User" ,
    required : true ,
    index : true
  } , 
  type : {
    type : String ,
    enum : ['post' , 'community' ] ,
    required : true ,
    index : true
  } ,
  community : {
    type : mongoose.Types.ObjectId ,
    ref : 'Community' ,
  } ,
  repost : {
    type : mongoose.Types.ObjectId ,
    ref : 'Post' ,
  } ,
  visiblity : {
    type : String ,
    enum : ['public' ,'followers' ,'private' ] ,
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
  } ,
  isAnonymous : {
    type : Boolean ,
    default : false
  } , 
  advertisement : {
    type : mongoose.Types.ObjectId ,
    ref : 'Advertisement' ,
    default : null
  } ,
  title : {
    type : String ,
    default : null ,
  } ,
  category : {
    type : String ,
    default : null ,
  } ,
  views : {
    type : Number ,
    default : 0 ,
  } ,
  engagements : {
    type : Number ,
    default : 0 ,
  } ,
  isAdvertisment : {
    type : Boolean ,
    default : false,
  } ,
  scheduledAt : {
    type : Date ,
  }
} , {timestamps : true})

postSchema.query.NoDelete = function() {
  return this.where({ isDeleted : false})
}

export const Post = mongoose.model("Post", postSchema);