import { createUser ,  createOtherUser} from "./user.helper.js";

let agent;
let streamId;

beforeAll(async () => {
  agent = await createUser();
  let other = await createOtherUser() ; 
  otherAgent = other.agent ; 
});

describe("Livestream", () => {
  it("should create a livestream", async () => {
    const res = await agent
    .post("/api/v1/livestream/create")
    .send({
      title : 'test' ,
      description : 'test' ,
    })

    expect(res.statusCode).toBe(201);
    streamId = res.body.data.stream._id;
  });



  it("should update livestream", async () => {
    const res = await agent.post(
      `/api/v1/live/update/${streamId}`
    )
    .send({
      title : 'updated test' ,
      description : 'updated test' ,
      isLive : true ,
    })

    expect(res.statusCode).toBe(200);
  });

  it("should get livestream", async () => {
    const res = await agent.get(
      `/api/v1/live/get/${streamId}`
    )
    expect(res.statusCode).toBe(200);
  });

  it('should not delete user live stream' , async() => {
    const res = await otherAgent.delete(`/api/v1/live/delete/${streamId}`)
    expect(res.statusCode).toBe(403);
  })

  it('should delete user live stream' , async() => {
    const res = await agent.delete(`/api/v1/live/delete/${streamId}`)
    expect(res.statusCode).toBe(200);
  })
});
