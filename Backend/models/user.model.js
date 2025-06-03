import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    username : {
        type : String ,
        required : true,
        unique : true,
    } ,
    password : {
        required : true,
        type : String ,
        minlength : 8,
    } ,
    email : {
        type : String ,
        required : true,
        unique : true,
        match: /.+\@.+\..+/ // Basic email validation
    } ,
    fullname : {
        type : String ,
        required : true ,
    } ,
    role : {
        type : String ,
        enum : ["user", "admin"],
        default : "user"
    } ,
    profilePicture : {
        type : String ,
        default : "" ,
    } ,
    banner : {
        type : String ,
        default : "" ,
    } ,
    refreshToken : {
        type : String 
    }

} , { timestamps : true})

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id : this._id ,
        username : this.username,
        role : this.role ,   
    } , process.env.ACCESS_TOKEN_SECERET , {
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

userSchema.methods.IsPasswordCorrect =async (password) => {
    return await bcrypt.compare(password, this.password);
}

export const User = mongoose.model("User", userSchema);