import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    name : {
        type : String ,
        index : true,
    } ,
    description : {
        type : String ,
    } ,
    owner : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'user' ,
        required : true
    } ,
    admins : [{
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'user' ,
        unique : true ,
        required : true ,
    }] ,
    type : {
        type : String ,
        enum : ['group' , 'one-on-one'] ,
        required : true
    } ,
    members : [{
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'user' ,
        unique : true ,
        required : true 
    }] ,
    archievedBy : [{
      type : mongoose.Schema.Types.ObjectId ,
      ref : 'user' ,
      required : true
    }] 
} , {
    timestamps : true
})    

export const Room = mongoose.model('Room' , roomSchema);