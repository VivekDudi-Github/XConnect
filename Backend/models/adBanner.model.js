import mongoose from 'mongoose' ;

const adBannerSchema = new mongoose.Schema({
  title : {
    type : String ,
    required : true ,
  } ,
  banner : [{
    public_id : {
      type : String ,
      required : true ,
    } , 
    url : {
      type : String ,
      required : true ,
    } ,
  }]
} , {timestamps : true})

export const AdBanner = mongoose.model('AdBanner' , adBannerSchema)