import mongoose from 'mongoose';

const hashtagSchema = new mongoose.Schema({
  name : {
    type : String ,
    required : true,
    unique : true,
    lowercase : true,
    index : true,
  } ,
  count : {
    type : Number ,
    default : 0,
  } ,
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    index: { expires: '0s' },
  }
} , { timestamps: true });

export const Hashtag = mongoose.model('Hashtag' , hashtagSchema); 