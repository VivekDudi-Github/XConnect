import mongoose from "mongoose";

const dislikeSchema = new mongoose.Schema({
  post: {
    type: mongoose.Types.ObjectId,
    ref: "Post",
    default : null ,
  },
  comment : {
    type: mongoose.Types.ObjectId,
    ref: "Comment",
    default: null
  } ,
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  }

}, { timestamps: true });

export const Dislikes = mongoose.model("Dislike", dislikeSchema);