import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema({
  post: {
    type: mongoose.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

export const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
