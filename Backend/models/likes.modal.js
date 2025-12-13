import mongoose from "mongoose";

const likesSchema = new mongoose.Schema({
  post: {
    type: mongoose.Types.ObjectId,
    ref: "Post",
    default : null ,
    index : true ,
  },
  comment : {
    type: mongoose.Types.ObjectId,
    ref: "Comment",
    default: null , 
    index : true ,
  } ,
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
    index : true ,
  }

}, { timestamps: true });

export const Likes = mongoose.model("Likes", likesSchema);