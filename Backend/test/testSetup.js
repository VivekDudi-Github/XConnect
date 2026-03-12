import mongoose from "mongoose";
import connectDB from "../utils/connectDB.js";

let mongo ;
beforeAll(async () => {
  mongo = await mongoose.connect(process.env.testMONGO_URI) ;
});

afterAll(async () => {
  try{
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      // await mongo.stop();
  }catch (error) {
      throw new Error("Error while closing the connection to the database" , error);
  }
});

