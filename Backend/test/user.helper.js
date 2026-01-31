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

  const response = await agent
    .post("/api/v1/user/signup")
    .send(userData);

  if (response.statusCode !== 201) {
    throw new Error("User creation failed");
  }

  let loginRes = await agent
    .post("/api/v1/user/login")
    .send(userData)
  if(loginRes.statusCode !== 200) throw new Error("Login failed");

  return agent;
}

export {createUser } ;