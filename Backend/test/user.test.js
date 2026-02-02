import { createUser } from "./user.helper.js";

let agent ;
beforeAll(async () => {
  agent = await createUser() ;
});

describe("get my profile" , () => {
    it("should return my profile" , async () => {
        const response = await agent.get("/api/v1/user/me");   
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });
})

describe('update user', () => { 
    it('should update user' , async () => {
      const response = await agent
      .patch("/api/v1/user/me")
      .send({
          fullname: "test2" ,
          bio : 'nothing' ,
          location : 'somewhere' ,
          hobby : 'nothing' ,
      })
  if(response.statusCode !== 200) console.log(response.body);
      
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.fullname).toBe("test2");
      expect(response.body.data.bio).toBe("nothing");
      expect(response.body.data.location).toBe("somewhere");
      expect(response.body.data.hobby).toBe("nothing");
    });
}) 

describe('change my password', () => {
    it('should change my password' , async () => {
      const response = await agent
      .put("/api/v1/user/me/password")
      .send({
          oldPassword : '12345678' ,
          newPassword : '123456789' ,
      })
    if(response.statusCode !== 200) console.log(response.body);
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });
}) 


describe('delete user', () => {
  it('should not allow delete user without pass' , async () => {
    const response = await agent
    .delete("/api/v1/user/me")

    if(response.statusCode !== 400) console.log(response.body); 
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  }) 
  it('should not allow delete user with wrong pass' , async () => {
    const response = await agent
    .delete("/api/v1/user/me")
    .send({
      password : '12345678' ,
    })

    if(response.statusCode !== 400) console.log(response.body);
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  })
})


describe('logout user', () => { 
  it('should logout user' , async () => {
    const response = await agent
    .post("/api/v1/user/logout")

    if(response.statusCode !== 200) console.log(response.body);
    expect(response.statusCode).toBe(200);
  })
})

describe('unauthenticated request', () => {
  it('should not allow unauthenticated request' , async () => {
    const response = await agent
    .get("/api/v1/user/me")
    
    if(response.statusCode !== 401) console.log(response.body);
    expect(response.statusCode).toBe(401);
  })
})


describe('login tries with wrong credentials', () => { 
  it('should not allow login with wrong pass' , async () => {
    agent = await createUser() ;
    let response = await agent
    .post("/api/v1/user/login")
    .send({
      email : 'test@test.com' ,
      password : '12345678' ,// real pass changed to 123456789 earlier
    })

    if(response.statusCode !== 400) console.log(response.body);    
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);

  })

  it("shouldn't allow login with wrong email" ,  async() => {
    let response = await agent
    .post("/api/v1/user/login")
    .send({
      email : 'testing@test.com' ,
      password : '123456789' ,
    })

    if(response.statusCode !== 400) console.log(response.body);    
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  })
}) 