import mongoose from 'mongoose' ;

const preferanceSchema = new mongoose.Schema({
  user : {
    type : mongoose.Types.ObjectId ,
    ref : 'User' ,
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

preferanceSchema.index({updatedAt : 1} , {expireAfterSeconds : 7*24*60*60})
export const Preferance = mongoose.model('Preferance' , preferanceSchema)