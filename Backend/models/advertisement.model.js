import mongoose from "mongoose";

const advertisementSchema = new mongoose.Schema({
  title : {
    type : String ,
    required : true ,
  } , 
  media : [{
    url : {
      type : String ,
      required : true ,
    } , 
    piblic_url : {
      type : String ,
      required : true ,
    } 
  }] ,
  description : {
    type : String ,
    required : true ,
  } ,
  price : {
    type : Number ,
    required : true ,
  } ,
  category : {
    type : String ,
    required : true ,
  } ,
  views : {
    type : Number ,
    default : 0 ,
  } ,

} , {timestamps : true})

export const advertisment  = mongoose.model('Avertisement' , advertisementSchema)