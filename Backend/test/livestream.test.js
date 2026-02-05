import { createUser ,  createOtherUser} from "./user.helper.js";

let agent;
let streamId;

beforeAll(async () => {
  agent = await createUser();
  let other = await createOtherUser() ; 
  otherAgent = other.agent ; 
},20000);

describe("Livestream", () => {
  it("should create a livestream", async () => {
    const res = await agent
    .post("/api/v1/live/create")
    .send({
      title : 'test' ,
      description : 'test' ,
    })

    if(res.statusCode !== 201) console.log(res.body) ;
    expect(res.statusCode).toBe(201);
    streamId = res.body.data._id;
  });

  it('should not update livestream with other user' , async() => {
    const res = await otherAgent.patch(
      `/api/v1/live/update/${streamId}`
    )
    .send({
      title : 'updated test' ,
      description : 'updated test' ,
      isLive : true ,
    })
    if(res.statusCode !== 403) console.log(res.body) ;
    expect(res.statusCode).toBe(403);
  })

  it("should update livestream", async () => {
    const res = await agent.patch(
      `/api/v1/live/update/${streamId}`
    )
    .send({
      title : 'updated test' ,
      description : 'updated test' ,
      isLive : true ,
    })
    if(res.statusCode !== 200) console.log(res.body) ;
    expect(res.statusCode).toBe(200);
  });

  it("should get livestream", async () => {
    const res = await agent.get(
      `/api/v1/live/${streamId}`
    )
    if(res.statusCode !== 200) console.log(res.body) ;
    expect(res.statusCode).toBe(200);
  });

  it('should not delete user live stream' , async() => {
    const res = await otherAgent.delete(`/api/v1/live/${streamId}`)

    if(res.statusCode !== 403) console.log(res.body) ;
    expect(res.statusCode).toBe(403);
  })



  it('should delete user live stream' , async() => {
    const res = await agent.delete(`/api/v1/live/${streamId}`)

    if(res.statusCode !== 200) console.log(res.body) ;
    expect(res.statusCode).toBe(200);
  })
});
