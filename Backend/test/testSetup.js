import mongoose from "mongoose";
import connectDB from "../utils/connectDB.js";


beforeAll(async () => {
  mongo = await connectDB();
});

afterEach(async () => {
  try {
    const collections = await mongoose.connection.db.collections();
  
    for (let collection of collections) {
      await collection.deleteMany();
    }
  } catch (error) {
      throw new Error("Error while cleaning the database" , error);
 }
});

afterAll(async () => {
  try{
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      await mongo.stop();
  }catch (error) {
      throw new Error("Error while closing the connection to the database" , error);
  }
});
