import request from "supertest"
import app from "../src/server"

describe("service-mgmt-service health check", () => {
  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health")
    expect(res.status).toBe(200)
    expect(res.body.status).toBe("ok")
    expect(res.body.service).toBe("service-mgmt-service")
  })
})
