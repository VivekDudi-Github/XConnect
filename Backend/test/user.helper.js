import { newServer as app } from "../app";
import request from "supertest";

const createUser = async () => {
  const agent = request.agent(app);
  const userData = {
    username: "test",
    password: "12345678",
    fullname: "test",
    email: "test@test.com",
  };
  console.log('test user started');

  const response = await agent
    .post("/api/v1/user/signup")
    .send(userData);
  
  console.log('user test signuped');
  if (response.statusCode !== 201) {
    console.log(response.body);
    throw new Error("User creation failed");
  }
  console.log('test user login started');
  
  let loginRes = await agent
    .post("/api/v1/user/login")
    .send(userData) 
  console.log('test user login done');
  
  if(loginRes.statusCode !== 200) throw new Error("Login failed");
  if(loginRes.statusCode !== 200) console.log(loginRes.body);
  
  return agent;
}

const createOtherUser = async () => {
  const agent = request.agent(app);
  const userData = {
    username: "test2",
    password: "12345678",
    fullname: "test2",
    email: "test2@test.com",
  };
  
  console.log('test-2- user started');
  const response = await agent
    .post("/api/v1/user/signup")
    .send(userData);

  if (response.statusCode !== 201) {
    throw new Error("User creation failed");
  }
  console.log('test-2- user signuped');
  let loginRes = await agent
    .post("/api/v1/user/login")
    .send(userData) 
  console.log('test-2- user logined');
  if(loginRes.statusCode !== 200) throw new Error("Login failed");
  return {agent , user : response.body.data } ;
}

export {createUser , createOtherUser } ;