import mongoose from "mongoose";

const liveStreamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  thumbnail: {
    public_id : {
      type : String ,
      default : '' ,
    } ,
    url : {
      type : String ,
      default : '' ,
    } ,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId ,
    ref : 'User' ,
    required: true,
  },
  startedAt: {
    type: Date,
    required: true,
  },
  isLive : {
    type : Boolean ,
    default : false ,
  },
  viewersCount : {
    type : Number ,
    default : 0 ,
  } ,
  producers : {
    videoId : {
      type : String ,
    } ,
    audioId : {
      type : String ,
    } ,
  } ,
  scheduledAt : {
    type : Date ,
    default : null ,
    index : true ,
  }
}, { timestamps: true });

export const LiveStream = mongoose.model("LiveStream", liveStreamSchema);