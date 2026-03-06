import mongoose from "mongoose";
import request from "supertest";
import app from "../../app";
import jwt from "jsonwebtoken";
import { createAndLoginUser, registerUser } from "../utils/test.helper";

describe("AUTH INTEGRATION TESTS", () => {
  const user = {
    email: "test@gmail.com",
    password: "Test123@",
    fullName: "Test User",
    role: "customer",
  };
  beforeEach(async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  /* ================= REGISTER ================= */

  it("REGISTER → success", async () => {
    const res = await registerUser(user);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("REGISTER → duplicate email", async () => {
    await registerUser(user);
    const res = await registerUser(user);

    expect(res.status).toBe(409);
  });

  it("REGISTER → missing email", async () => {
    const res = await registerUser({
      password: user.password,
      fullName: user.fullName,
    });

    expect(res.status).toBe(400);
  });

  it("REGISTER → invalid email format", async () => {
    const res = await registerUser({
      ...user,
      email: "invalid",
    });

    expect(res.status).toBe(400);
  });

  /* ================= LOGIN ================= */

  it("LOGIN → success", async () => {
    await registerUser(user);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("LOGIN → wrong password", async () => {
    await registerUser(user);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "Wrong123@" });

    expect(res.status).toBe(401);
  });

  it("LOGIN → non-existing email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "no@email.com", password: "Test123@" });

    expect(res.status).toBe(401);
  });

  it("LOGIN → missing password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email });

    expect(res.status).toBe(400);
  });

  /* ================= TOKEN ================= */

  it("TOKEN → contains userId and role", async () => {
    const token = await createAndLoginUser(user);

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    expect(decoded.id).toBeDefined();
    expect(decoded.role).toBe("customer");
  });

  it("AUTH MIDDLEWARE → no token", async () => {
    const res = await request(app).get("/api/profile");

    expect(res.status).toBe(401);
  });

  it("AUTH MIDDLEWARE → invalid token", async () => {
    const res = await request(app)
      .get("/api/profile")
      .set("Authorization", "Bearer invalidtoken");

    expect(res.status).toBe(401);
  });

  it("AUTH MIDDLEWARE → valid token", async () => {
    const token = await createAndLoginUser(user);

    const res = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
  it("REGISTER → duplicate email", async () => {
    const user = {
      email: "dup@test.com",
      password: "Test123@",
      fullName: "Dup User",
    };

    await request(app).post("/api/auth/register").send(user);

    const res = await request(app).post("/api/auth/register").send(user);

    expect(res.status).not.toBe(201);
  });

  it("LOGIN → wrong password", async () => {
    const user = {
      email: "wrongpass@test.com",
      password: "Test123@",
      fullName: "Wrong Pass",
    };

    await request(app).post("/api/auth/register").send(user);

    const res = await request(app).post("/api/auth/login").send({
      email: user.email,
      password: "WrongPassword",
    });

    expect(res.status).not.toBe(200);
  });
  it("LOGIN → user does not exist", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nouser@test.com",
      password: "Test123@",
    });

    expect(res.status).not.toBe(200);
  });
  it("AUTH → token without Bearer prefix", async () => {
    const token = await createAndLoginUser({
      email: "bearer@test.com",
      password: "Test123@",
      fullName: "Bearer User",
      role: "customer",
    });

    const res = await request(app)
      .get("/api/profile")
      .set("Authorization", token); // ❌ No Bearer

    expect(res.status).toBe(401);
  });
  it("REGISTER → missing email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      password: "Test123@",
      fullName: "No Email User",
    });

    expect(res.status).not.toBe(201);
  });
  it("LOGIN → missing password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@test.com",
    });

    expect(res.status).not.toBe(200);
  });
  it("LOGIN → missing password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@test.com",
    });

    expect(res.status).not.toBe(200);
  });
  it("REGISTER → invalid email format", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "invalid-email",
      password: "Test123@",
      fullName: "Invalid Email",
    });

    expect(res.status).not.toBe(201);
  });
});
