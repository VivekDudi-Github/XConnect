import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs'


const userSchema = new mongoose.Schema({
    username : {
        type : String ,
        required : true,
        unique : true,
        index : true,
    } ,
    password : {
        required : true,
        type : String ,
    } ,
    streamKey : {
        type : String ,
        unique : true ,
        index : true,
    } ,
    email : {
        type : String ,
        required : true,
        unique : true,
        match: /.+\@.+\..+/ 
    } ,
    fullname : {
        type : String ,
        required : true ,
    } ,
    hobby : {
        type : String ,
    } ,
    bio : {
        type : String ,
    } ,
    location : {
        type : String ,
    } ,
    role : {
        type : String ,
        enum : ["user", "admin"],
        default : "user"
    } ,
    avatar : {
        publicId : {
            type : String ,
            default : "" ,
        } , 
        url : {
            type : String ,
            default : "" // Default placeholder image
        }
    } ,
    banner : {
        publicId : {
            type : String ,
            default : "" ,
        } , 
        url : {
            type : String ,
            default : "" // Default placeholder image
        }
    } ,
    refreshToken : {
        type : String 
    } , 
    lastOnline : {
        type : Date ,
        default : null ,
    }
} , { timestamps : true})

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id : this._id ,
        username : this.username,
        role : this.role ,   
        avatar : this.avatar ,
    } , process.env.ACCESS_TOKEN_SECRET , {
        expiresIn : process.env.ACCESS_TOKEN_SECRET_EXPIRES_IN
    }
    )
}

userSchema.methods.generateRefreshToken = function(){
   return jwt.sign({
        _id : this._id ,
    } , 
    process.env.REFRESH_TOKEN_SECRET , {
        expiresIn : process.env.REFRESH_TOKEN_SECRET_EXPIRES_IN
    }
    )
}

userSchema.methods.IsPasswordCorrect =async function(password) {
    return await bcrypt.compare(password, this.password);
}



export const User = mongoose.model("User", userSchema);