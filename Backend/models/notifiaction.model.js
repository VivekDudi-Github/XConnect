import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const notificationSchema = new Schema(
  {
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true, 
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'follow', 'repost'],
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    reply: {
      type: Schema.Types.ObjectId,
      ref: 'Reply',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '5d', 
    },
  },
  {
    versionKey : false ,
  }
);

export const Notification = model('Notification', notificationSchema);
