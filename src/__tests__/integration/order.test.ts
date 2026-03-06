import request from "supertest";
import app from "../../app";
import mongoose from "mongoose";
import { createAndLoginUser } from "../utils/test.helper";
import { OrderModel } from "../../models/order.model";

describe("ORDER INTEGRATION TESTS", () => {
  const customer = {
    email: "customer@test.com",
    password: "Test123@",
    fullName: "Customer User",
    role: "customer",
  };

  const seller = {
    email: "seller@test.com",
    password: "Test123@",
    fullName: "Seller User",
    role: "seller",
  };

  const orderPayload = {
    items: [
      {
        productId: new mongoose.Types.ObjectId(),
        name: "Test Product",
        image: "image.png",
        quantity: 2,
        price: 100,
      },
    ],
    total: 200,
  };

  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  /* ================= CREATE ORDER ================= */

  it("CUSTOMER → create order success", async () => {
    const token = await createAndLoginUser(customer);

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send(orderPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(200);
  });

  it("CREATE ORDER → cart empty", async () => {
    const token = await createAndLoginUser(customer);

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [], total: 0 });

    expect(res.status).toBe(400);
  });

  it("CREATE ORDER → unauthorized (no token)", async () => {
    const res = await request(app).post("/api/orders").send(orderPayload);

    expect(res.status).toBe(401);
  });

  it("SELLER → can create order (currently allowed)", async () => {
    const token = await createAndLoginUser(seller);

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send(orderPayload);

    expect(res.status).toBe(201);
  });

  /* ================= GET MY ORDERS ================= */

  it("GET MY ORDERS → returns only user orders", async () => {
    const token = await createAndLoginUser(customer);

    await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send(orderPayload);

    const res = await request(app)
      .get("/api/orders/my-orders")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it("GET MY ORDERS → unauthorized", async () => {
    const res = await request(app).get("/api/orders/my-orders");

    expect(res.status).toBe(401);
  });

  /* ================= DELETE ORDER ================= */

  it("DELETE ORDER → success (own order)", async () => {
    const token = await createAndLoginUser(customer);

    const createRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send(orderPayload);

    const orderId = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/orders/${orderId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("DELETE ORDER → cannot delete others order", async () => {
    const token1 = await createAndLoginUser(customer);
    const token2 = await createAndLoginUser({
      ...customer,
      email: "another@test.com",
    });

    const createRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token1}`)
      .send(orderPayload);

    const orderId = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/orders/${orderId}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(res.status).toBe(403);
  });

  it("DELETE ORDER → not found", async () => {
    const token = await createAndLoginUser(customer);

    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/orders/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  /* ================= EXTRA EDGE CASES ================= */

  it("CREATE ORDER → missing total", async () => {
    const token = await createAndLoginUser(customer);

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: orderPayload.items,
      });

    expect(res.status).toBe(400);
  });

  it("CREATE ORDER → invalid token", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", "Bearer invalidtoken")
      .send(orderPayload);

    expect(res.status).toBe(401);
  });
});
