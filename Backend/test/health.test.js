import {newServer as app} from "../app.js";
import request from "supertest";

describe("health check" , () => {
    it("should return 200" , async () => {
        const response = await request(app).get("/api/v1/health-check");
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });
});
