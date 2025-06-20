import mongoose from 'mongoose' ;

const preferanceSchema = new mongoose.Schema({
  user : {
    type : mongoose.Types.ObjectId ,
    ref : 'user' ,
    required : true,
    index: true 
  } ,
  hashtags : {
    type : String ,
    required : true ,
    index : true
  } ,
  score : {
    type : Number ,
    default : 0 ,
    required : true ,
  } ,
} , {timestamps : true})

export const Preferance = mongoose.model('Preferance' , preferanceSchema)