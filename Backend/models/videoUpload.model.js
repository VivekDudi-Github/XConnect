import mongoose from "mongoose";

const videoUploadSchema = new mongoose.Schema({
  public_id : {
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
  fileSize : {type : Number , required : true} ,
  fileType : {type : String , required : true} ,
  finalPath : {type : String } ,

  status : {
    type : String , 
    default : 'uploading' ,
    enum : ['processing' , 'uploading' , 'failed' , 'completed'] ,
  } ,

} , {timestamps : true}) ;

export const VideoUpload =  mongoose.model("videoUpload" , videoUploadSchema); 