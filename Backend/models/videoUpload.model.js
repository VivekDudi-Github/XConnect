import mongoose from "mongoose";

const videoUploadSchema = new mongoose.Schema({
  uploadId : {
    type : String ,
    required : true ,
  } ,
  user : {
    type : mongoose.Schema.Types.ObjectId ,
    ref : 'users' ,
    required : true ,
  } ,
  uploadedChunks : {type : [Number] , default : []} ,
  totalChunks : {type : Number , default : 0 } ,
  status : {
    type : String , 
    default : 'pending' ,
    enum : ['pending' , 'failed' , 'completed'] ,
  } ,
} , {timestamps : true}) ;

export const VideoUpload =  mongoose.model("videoUpload" , videoUploadSchema); 