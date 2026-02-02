import { createUser, createOtherUser } from "./user.helper.js";

let agent;
let otherAgent;
let otherUserId;

beforeAll(async () => {
  agent = await createUser();
  const other = await createOtherUser();
  otherAgent = other.agent;
  otherUserId = other.user._id;
});

describe("Follow system", () => {
  it("should follow another user", async () => {
    const res = await agent.post(`/api/v1/user/${otherUserId}/follow`);

    expect(res.statusCode).toBe(200);
  });

  it("should unfollow same user again", async () => {
    const res = await agent.post(`/api/v1/user/${otherUserId}/follow`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.operation).toBe(false);
  });
});
