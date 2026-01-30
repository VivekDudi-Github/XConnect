import mongoose from "mongoose";
import dotenv from "dotenv";
import {MongoMemoryServer} from 'mongodb-memory-server' ;


dotenv.config({
    path : '../.env'
});

const connectDB = async () => {
    try {
        let uri ;        
        if(process.env.NODE_ENV === 'TEST'){
            let mongoServer = await MongoMemoryServer.create() ; 
            uri = mongoServer.getUri() ;
        }else uri = process.env.MONGODB_URL;
        
        await mongoose.connect(uri) ;
        console.log("mongoDB Connected");
    } catch (error) {
        console.log("---error in connecting with the mongoDB servers : --" , error);
        process.exit() ;
    }
}

export default connectDB;