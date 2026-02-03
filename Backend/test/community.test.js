import { createUser , createOtherUser } from "./user.helper.js";

let agent;
let communityId;
let otherAgent;

beforeAll(async () => {
  agent = await createUser();
  let other = await createOtherUser();
  otherAgent = other.agent;
} , 15000);

describe("Communities", () => {
  it("should create a community", async () => {
    const res = await agent
      .post("/api/v1/community/create")
      .send({ 
        name: "Test Community" ,
        description : "test community description" ,
        rules : ["rule1" , "rule2"] ,
        tags : ["tag1" , "tag2"] ,
      });
    if(res.statusCode !== 201) console.log(res.body);
    expect(res.statusCode).toBe(201);
    communityId = res.body.data._id;
  });

  it("should join a community", async () => {
    const res = await agent.post(
      `/api/v1/community/follow/${communityId}`
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.data.operation).toBe(true);
  });

  // it("should unfollow a community", async () => {
  //   const res = await agent.post(
  //     `/api/v1/community/follow/${communityId}`
  //   );

  //   expect(res.statusCode).toBe(200);
  //   expect(res.body.data.operation).toBe(false);
  // });

  // it("shouldn't toggle join as mod if not invited" , async () => {
  //   const res = await otherAgent
  //     .post(`/api/v1/community/toggleMode/${communityId}`);

  //   expect(res.statusCode).toBe(403);
  //   expect(res.body.message).toBe('NOT_INVITED');
  // });

  // it("shouldn't allow non-creator to invite mods" , async () => {
  //   const res = await otherAgent
  //     .post('/api/v1/community/invite-mods')
  //     .send({
  //       communityId ,
  //       userIds : [otherAgent.userId]
  //     });
  //   expect(res.statusCode).toBe(403);
  // });
  


  // it("should invite a user to be mod" , async () => {
  //   const res = await agent
  //     .post('/api/v1/community/invite-mods')
  //     .send({
  //       communityId ,
  //       userIds : [otherAgent.userId]
  //     });

  //   expect(res.statusCode).toBe(200);
  // });

  // it("should check if user is invited to be mod" , async () => {
  //   const res = await otherAgent
  //     .get(`/api/v1/community/is-invited/${communityId}`);

  //   expect(res.statusCode).toBe(200);
  //   expect(res.body.data.isInvited).toBe(true);
  // });

  // it("should toggle join as mod" , async () => {
  //   const res = await otherAgent
  //     .post(`/api/v1/community/toggleMode/${communityId}`);

  //   expect(res.statusCode).toBe(200);
  //   expect(res.body.data.operation).toBe(true);
  // });

});
