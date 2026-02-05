import { createUser } from "./user.helper.js";

let agent;
beforeAll(async () => {
  agent = await createUser();
} , 20000);

describe("SuperChat Payment", () => {
  it("should create a superchat payment intent", async () => {
    const res = await agent.post("/api/v1/stripe/payment/superchat/create")
    .send({
      streamId : "64a1c8e5f0d5b2b1c8e4d2a" ,
      message : "This is a superchat message" ,
      amount : 500 , 
    });

    if(res.statusCode !== 200) console.log(res.body) ;
    expect(res.statusCode).toBe(200);
  });
})