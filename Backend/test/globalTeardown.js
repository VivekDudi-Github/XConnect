export default async function globalTeardown() {
  // 1. Retrieve the instance we saved in setup
  const instance = globalThis.__MONGOINSTANCE;
  
  // 2. Stop the server
  if (instance) {
    await instance.stop();
  }
};