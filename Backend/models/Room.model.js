import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    name : {
        type : String ,
        required : true,
        index : true,
    } ,
    description : {
        type : String ,
        required : true,
    } ,
    owner : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'user' ,
        required : true
    } ,
    admins : [{
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'user' ,
        required : true
    }] ,
    type : {
        type : String ,
        enum : ['group' , 'one-to-one'] ,
        required : true
    } ,
    members : [{
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'user' ,
        required : true 
    }] ,
    isArchived : {
        type : Boolean ,
        default : false
    } ,
    archievedBy : [{
      type : mongoose.Schema.Types.ObjectId ,
      ref : 'user' ,
      required : true
    }] ,
    createdAt : {
        type : Date ,
        default : Date.now
    } ,
    updatedAt : {
        type : Date ,
        default : Date.now
    }
} , {
    timestamps : true
})    

export const Room = mongoose.model('Room' , roomSchema);