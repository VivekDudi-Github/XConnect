import mongoose from 'mongoose' ;

const preferanceSchema = new mongoose.Schema({
  user : {
    type : mongoose.Types.ObjectId ,
    ref : 'user' ,
    required : true,
  } ,
  hashtags : {
    type : String ,
    required : true ,
  } ,
  score : {
    type : Number ,
    default : 0 ,
  }
  
} , {timestamps : true})

export const preferance = mongoose.model('preferance' , preferanceSchema)