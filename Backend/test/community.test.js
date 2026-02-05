import { createUser , createOtherUser } from "./user.helper.js";

let agent;
let communityId , communityPostId;
let otherAgent;
let other ;

beforeAll(async () => {
  agent = await createUser();
  other = await createOtherUser();
  otherAgent = other.agent;
} , 20000);

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

  it('should create a community post' , async() => {
    const res = await agent
      .post("/api/v1/post")
      .send({
        content: "Hello world" ,
        isCommunityPost : true ,
        title : "Hello world" ,
        category : "general" ,
        type : "community" ,
        isAnonymous : false ,
        community : communityId , // fake community id for testing
      });

    if(res.statusCode !== 201) console.log(res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty("_id");
    expect(res.body.data.category).toBe("general"); 
    expect(res.body.data).toHaveProperty("_id");

    communityPostId = res.body.data._id;
  }) ;

  it('should not get community post without author' , async() => {
    let res =  await otherAgent.get('/api/v1/post/'+communityPostId)

    if(res.statusCode !== 200) console.log(res.body);
    expect(res.statusCode).toBe(200);
  }) ;

  it("should join a community", async () => {
    const res = await otherAgent.post(
      `/api/v1/community/follow/${communityId}`
    );
    if(res.statusCode !== 200) console.log(res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.operation).toBe(true);
  });

  it("should unfollow a community", async () => {
    const res = await otherAgent.post(
      `/api/v1/community/follow/${communityId}`
    );
    if(res.statusCode !== 200) console.log(res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.operation).toBe(false);
  });

  it("shouldn't toggle join as mod if not invited" , async () => {
    const res = await otherAgent
      .post(`/api/v1/community/toggleMod/${communityId}`);

    if(res.statusCode !== 403) console.log(res.body);
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("shouldn't allow non-creator to invite mods" , async () => {
    const res = await otherAgent
      .post('/api/v1/community/invite-mods')
      .send({
        communityId ,
        mods : [other.user._id]
      });
    if(res.statusCode !== 403) console.log(res.body , );
    expect(res.statusCode).toBe(403);
  });
  


  it("should invite a user to be mod" , async () => {
    const res = await agent
      .post('/api/v1/community/invite-mods')
      .send({
        communityId ,
        mods : [other.user._id]
      });

    if(res.statusCode !== 200) console.log(res.body);
    expect(res.statusCode).toBe(200);
  });

  it("should be able to check if user is invited to be mod" , async () => {
    const res = await otherAgent
      .get(`/api/v1/community/is-invited/${communityId}`);

    if(res.statusCode !== 200) console.log(res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.isInvited).toBe(true);
  });

  it("should toggle join as mod" , async () => {
    const res = await otherAgent
      .post(`/api/v1/community/toggleMod/${communityId}`);

    if(res.statusCode !== 200) console.log(res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.operation).toBe(true);
  });

  it("should leave as a mod" , async () => {
    const res = await otherAgent
      .post(`/api/v1/community/toggleMod/${communityId}`);

    if(res.statusCode !== 200) console.log(res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.operation).toBe(false);
  });

  it("shouldn't toggle join as mod" , async () => {
    const res = await otherAgent
      .post(`/api/v1/community/toggleMod/${communityId}`);

    if(res.statusCode !== 403) console.log(res.body);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('You are not invited as moderator');
  });

});
