import mongoose from "mongoose";
import dotenv from "dotenv";
import {MongoMemoryServer} from 'mongodb-memory-server' ;


dotenv.config({
    path : '../.env'
});

const connectDB = async () => {
    try {
        let uri , mongoTestServer ;        
        if(process.env.NODE_ENV === 'TEST'){
            mongoTestServer = await MongoMemoryServer.create() ;  
            uri = mongoTestServer.getUri() ;
        }else uri = process.env.MONGODB_URL;
        
        await mongoose.connect(uri , {
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }) ;
        
        console.log("mongoDB Connected");
        if(mongoTestServer) return mongoTestServer ;
    } catch (error) {
        console.log("---error in connecting with the mongoDB servers : --" , error);
        process.exit() ;
    }
}

export default connectDB;