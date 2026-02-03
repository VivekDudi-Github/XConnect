import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

export default async function globalSetup() {
  // 1. Create the Mongo Memory Server instance
  const instance = await MongoMemoryServer.create();
  process.env.testMONGO_URI = instance.getUri()
  
  // 3. Store the instance in a global variable so we can stop it later
  // We use `globalThis` to share this state with the teardown script
  globalThis.__MONGOINSTANCE = instance; 
};