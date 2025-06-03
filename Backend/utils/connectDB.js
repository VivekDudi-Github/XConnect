import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({
    path : '../.env'
});

const connectDB = async () => {
    try {
        
        await mongoose.connect(process.env.MONGODB_URL) ;
        console.log("mongoDB Connected");
    } catch (error) {
        console.log("---error in connecting with the mongoDB servers : --" , error);
        process.exit() ;
    }
}

export default connectDB;