import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  from : {
    type : mongoose.Schema.Types.ObjectId ,
    ref : 'User' ,
    required : true
  } ,
  room : {
    type : mongoose.Schema.Types.ObjectId ,
    ref : 'Room' ,
    required : true
  } ,
  message : {
    type : String ,
    required : true
  } , 
  isDeleted : {
    type : Boolean ,
    default : false
  } ,
  attachment : [{
    url: { type: String, required: true },
    type: { type: String, required: true },
    public_id: { type: String, required: true } ,
  }] ,
} , {
  timestamps : true
});

export const Message = mongoose.model('Message' , messageSchema);