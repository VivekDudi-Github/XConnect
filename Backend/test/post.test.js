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

let commentId ;
describe('comments', () => { 
  it('should create a comment' , async () => {
    const res = await agent
      .post(`/api/v1/comment/${postId}`)
      .send({
        content : 'Hello world' ,
      })
    if(res.statusCode !== 201) console.log(res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('_id');
    commentId = res.body.data._id;
  })

  it('should get comments of a post' , async () => {
    const res = await agent
      .get(`/api/v1/comment/post/${postId}`)

    if(res.statusCode !== 200) console.log(res.body);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  })

  it('should get comment' , async () => {
    const res = await agent.
      get(`/api/v1/comment/${commentId}`)

    if(res.statusCode !== 200) console.log(res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('_id');
  })

  it('should not allow other user to delete my comment', async () => {
    const res = await otherAgent.delete(`/api/v1/comment/${commentId}`);

    if(res.statusCode !== 403) console.log(res.body);
    expect(res.statusCode).toBe(403);
  });

  it('should allow owner to delete comment', async () => {
    const res = await agent.delete(`/api/v1/comment/${commentId}`);

    if(res.statusCode !== 200) console.log(res.body);
    expect(res.statusCode).toBe(200);
  });

  it('should not get the comment' , async() => {
    let res =  await agent.get('/api/v1/comment/'+commentId)

    if(res.statusCode !== 404) console.log(res.body);
    expect(res.statusCode).toBe(404);
  })

  it('should like the comment' , async() => {
    const res = await agent
      .post(`/api/v1/comment/like/${commentId}`)

    if(res.statusCode !== 200) console.log(res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('operation');
  })

    it('should dislike the comment' , async() => {
    const res = await agent
      .post(`/api/v1/comment/dislike/${commentId}`)

    if(res.statusCode !== 200) console.log(res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('operation');
  })

}) 
