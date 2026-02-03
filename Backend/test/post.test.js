// import { createUser, createOtherUser } from "./user.helper.js";

// let agent;
// let otherAgent;
// let postId;

// beforeAll(async () => {
//   agent = await createUser();
//   otherAgent = await createOtherUser();
// });

// describe("Posts", () => {
//   it("should create a post", async () => {
//     const res = await agent
//       .post("/api/v1/posts")
//       .send({ content: "Hello world" });

//     expect(res.statusCode).toBe(201);
//     expect(res.body.data.post).toHaveProperty("_id");

//     postId = res.body.data.post._id;
//   });

//   it("should not allow other user to delete my post", async () => {
//     const res = await otherAgent.delete(`/api/v1/posts/${postId}`);

//     expect(res.statusCode).toBe(403);
//   });

//   it("should allow owner to delete post", async () => {
//     const res = await agent.delete(`/api/v1/posts/${postId}`);

//     expect(res.statusCode).toBe(200);
//   });
// });
