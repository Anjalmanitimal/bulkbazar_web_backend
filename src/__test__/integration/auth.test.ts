import request from "supertest";
import app from "../../app";

describe("AUTH INTEGRATION TESTS", () => {
  const user = {
    email: "test@gmail.com",
    password: "password123",
    fullName: "Test User",
  };

  it("REGISTER → success", async () => {
    const res = await request(app).post("/auth/register").send(user);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("REGISTER → duplicate email", async () => {
    await request(app).post("/auth/register").send(user);

    const res = await request(app).post("/auth/register").send(user);

    expect(res.status).toBe(409);
  });

  it("LOGIN → success", async () => {
    await request(app).post("/auth/register").send(user);

    const res = await request(app).post("/auth/login").send({
      email: user.email,
      password: user.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("LOGIN → wrong password", async () => {
    await request(app).post("/auth/register").send(user);

    const res = await request(app).post("/auth/login").send({
      email: user.email,
      password: "wrongpass",
    });

    expect(res.status).toBe(401);
  });
});
