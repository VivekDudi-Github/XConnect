import mongoose from "mongoose";
import { validate } from "uuid";

const advertisementSchema = new mongoose.Schema({
  posts : [{
    _id : mongoose.Schema.Types.ObjectId ,
    type : {
      type : String ,
      enum : ['comment' , 'post' ]
    }
  }] ,
  price : {
    type : Number ,
    enum : [100 , 200 , 500 , 1000]
  } ,
  views : {
    type : Number ,
    default : 0 ,
  } ,
  tags : {
    type : [String] ,
    validate : (v) => v.length > 0 && v.length <= 10 ,
  }
} , {timestamps : true})

export const advertisment  = mongoose.model('Avertisement' , advertisementSchema)