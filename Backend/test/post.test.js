import { createUser, createOtherUser } from "./user.helper.js";

let agent;
let otherAgent;
let postId ;

beforeAll(async () => {
  agent = await createUser();
  let other = await createOtherUser();
  otherAgent = other.agent;
} , 20000);

describe("Posts", () => {
  it("should create a post", async () => {
    const res = await agent
      .post("/api/v1/post")
      .send({content: "Hello world"});

    if(res.statusCode !== 201) console.log(res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty("_id");
    postId = res.body.data._id;
  });
  it("should get the post" , async() => {
    let res =  await agent.get('/api/v1/post/'+postId)

    if(res.statusCode !== 200) console.log(res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('_id');
  })


  it("should not allow other user to delete my post", async () => {
    const res = await otherAgent.delete(`/api/v1/post/${postId}`);

    if(res.statusCode !== 403) console.log(res.body);
    expect(res.statusCode).toBe(403);
  });

  it("should allow owner to delete post", async () => {
    const res = await agent.delete(`/api/v1/post/${postId}`);

    if(res.statusCode !== 200) console.log(res.body);
    expect(res.statusCode).toBe(200);
  });

  it("shouldn't get the post" , async() => {
    let res =  await agent.get('/api/v1/post/'+postId)

    if(res.statusCode !== 404) console.log(res.body);
    expect(res.statusCode).toBe(404);
  })

});
