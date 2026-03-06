import request from "supertest";
import app from "../../app";
import mongoose from "mongoose";
import { createAndLoginUser } from "../utils/test.helper";
import { UserModel } from "../../models/user.model";

describe("PROFILE INTEGRATION TESTS", () => {
  const userData = {
    email: "profile@test.com",
    password: "Test123@",
    fullName: "Profile User",
    role: "customer",
  };

  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  /* ================= GET PROFILE ================= */

  it("GET PROFILE → success", async () => {
    const token = await createAndLoginUser(userData);

    const res = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(userData.email);
  });

  it("GET PROFILE → unauthorized (no token)", async () => {
    const res = await request(app).get("/api/profile");

    expect(res.status).toBe(401);
  });

  it("GET PROFILE → invalid token", async () => {
    const res = await request(app)
      .get("/api/profile")
      .set("Authorization", "Bearer invalidtoken");

    expect(res.status).toBe(401);
  });

  /* ================= UPLOAD PROFILE IMAGE ================= */

  it("UPLOAD PROFILE IMAGE → success", async () => {
    const token = await createAndLoginUser(userData);

    const res = await request(app)
      .post("/api/profile/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("image", Buffer.from("fake-image"), "profile.png");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.profileImage).toContain("/uploads/profile/");
  });

  it("UPLOAD PROFILE IMAGE → no image uploaded", async () => {
    const token = await createAndLoginUser(userData);

    const res = await request(app)
      .post("/api/profile/upload")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("UPLOAD PROFILE IMAGE → unauthorized (no token)", async () => {
    const res = await request(app)
      .post("/api/profile/upload")
      .attach("image", Buffer.from("fake-image"), "profile.png");

    expect(res.status).toBe(401);
  });

  it("UPLOAD PROFILE IMAGE → invalid token", async () => {
    const res = await request(app)
      .post("/api/profile/upload")
      .set("Authorization", "Bearer invalidtoken")
      .attach("image", Buffer.from("fake-image"), "profile.png");

    expect(res.status).toBe(401);
  });

  it("UPLOAD PROFILE IMAGE → updates user in database", async () => {
    const token = await createAndLoginUser(userData);

    await request(app)
      .post("/api/profile/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("image", Buffer.from("fake-image"), "profile.png");

    const user = await UserModel.findOne({ email: userData.email });

    expect(user?.profileImage).toContain("/uploads/profile/");
  });

  it("UPLOAD PROFILE IMAGE → multiple uploads overwrite image", async () => {
    const token = await createAndLoginUser(userData);

    const firstUpload = await request(app)
      .post("/api/profile/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("image", Buffer.from("fake-image"), "profile1.png");

    const secondUpload = await request(app)
      .post("/api/profile/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("image", Buffer.from("fake-image"), "profile2.png");

    expect(secondUpload.body.profileImage).not.toBe(
      firstUpload.body.profileImage,
    );
  });
});
