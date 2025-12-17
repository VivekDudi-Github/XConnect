import mongoose from "mongoose";

const likesCountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  count: {
    type: Number,
    default: 0,
    required: true,
  },
}, { timestamps: true }); 
likesCountSchema.index({ user: 1, createdAt: -1 });

export const LikesCount = mongoose.model("LikesCount", likesCountSchema);