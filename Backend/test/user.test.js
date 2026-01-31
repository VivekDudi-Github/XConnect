import { createUser } from "./user.helper.js";

let agent ;
beforeAll(async () => {
  agent = await createUser() ;
});

describe("get my profile" , () => {
    it("should return my profile" , async () => {
        const response = await agent.get("/api/v1/user/me");
        console.log(response.body);
        
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });
})