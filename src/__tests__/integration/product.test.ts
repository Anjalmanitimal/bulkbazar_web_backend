import request from "supertest";
import app from "../../app";
import { createAndLoginUser } from "../utils/test.helper";
import { ProductModel } from "../../models/product.model";

describe("PRODUCT INTEGRATION TESTS", () => {
  const sellerUser = {
    email: "seller@test.com",
    password: "Test123@",
    fullName: "Seller User",
    role: "seller",
  };

  const customerUser = {
    email: "customer@test.com",
    password: "Test123@",
    fullName: "Customer User",
    role: "customer",
  };

  const productData = {
    name: "Test Product",
    description: "Test Description",
    category: "electronics",
    pricing: [
      { moq: 10, price: 100 },
      { moq: 50, price: 90 },
    ],
  };

  /* ================= CREATE PRODUCT ================= */

  it("SELLER → create product success", async () => {
    const token = await createAndLoginUser(sellerUser);

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .field("name", productData.name)
      .field("description", productData.description)
      .field("category", productData.category)
      .field("pricing", JSON.stringify(productData.pricing))
      .attach("image", Buffer.from("fake-image"), "test.png");

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const productInDb = await ProductModel.findOne({
      name: productData.name,
    });

    expect(productInDb).toBeTruthy();
  });

  it("CUSTOMER → cannot create product", async () => {
    const token = await createAndLoginUser(customerUser);

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .field("name", productData.name)
      .field("description", productData.description)
      .field("category", productData.category)
      .field("pricing", JSON.stringify(productData.pricing))
      .attach("image", Buffer.from("fake-image"), "test.png");

    expect(res.status).toBe(403);
  });

  /* ================= GET PRODUCTS ================= */

  it("GET → all products", async () => {
    const token = await createAndLoginUser(sellerUser);

    await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .field("name", productData.name)
      .field("description", productData.description)
      .field("category", productData.category)
      .field("pricing", JSON.stringify(productData.pricing))
      .attach("image", Buffer.from("fake-image"), "test.png");

    const res = await request(app).get("/api/products");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET → product by id", async () => {
    const token = await createAndLoginUser(sellerUser);

    const createRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .field("name", productData.name)
      .field("description", productData.description)
      .field("category", productData.category)
      .field("pricing", JSON.stringify(productData.pricing))
      .attach("image", Buffer.from("fake-image"), "test.png");

    const productId = createRes.body.data._id;

    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(productId);
  });

  /* ================= UPDATE PRODUCT ================= */

  it("SELLER → update own product", async () => {
    const token = await createAndLoginUser(sellerUser);

    const createRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .field("name", productData.name)
      .field("description", productData.description)
      .field("category", productData.category)
      .field("pricing", JSON.stringify(productData.pricing))
      .attach("image", Buffer.from("fake-image"), "test.png");

    const productId = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${token}`)
      .field("name", "Updated Product")
      .field("description", productData.description)
      .field("category", productData.category)
      .field("pricing", JSON.stringify(productData.pricing));

    expect(res.status).toBe(200);
  });

  it("SELLER → cannot update other seller product", async () => {
    const seller1Token = await createAndLoginUser({
      ...sellerUser,
      email: "seller1@test.com",
    });

    const seller2Token = await createAndLoginUser({
      ...sellerUser,
      email: "seller2@test.com",
    });

    const createRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${seller1Token}`)
      .field("name", productData.name)
      .field("description", productData.description)
      .field("category", productData.category)
      .field("pricing", JSON.stringify(productData.pricing))
      .attach("image", Buffer.from("fake-image"), "test.png");

    const productId = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${seller2Token}`)
      .field("name", "Hacked Product");

    expect(res.status).toBe(403);
  });

  /* ================= DELETE PRODUCT ================= */

  it("SELLER → delete own product", async () => {
    const token = await createAndLoginUser(sellerUser);

    const createRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .field("name", productData.name)
      .field("description", productData.description)
      .field("category", productData.category)
      .field("pricing", JSON.stringify(productData.pricing))
      .attach("image", Buffer.from("fake-image"), "test.png");

    const productId = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("SELLER → cannot delete other seller product", async () => {
    const seller1Token = await createAndLoginUser({
      ...sellerUser,
      email: "sellerA@test.com",
    });

    const seller2Token = await createAndLoginUser({
      ...sellerUser,
      email: "sellerB@test.com",
    });

    const createRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${seller1Token}`)
      .field("name", productData.name)
      .field("description", productData.description)
      .field("category", productData.category)
      .field("pricing", JSON.stringify(productData.pricing))
      .attach("image", Buffer.from("fake-image"), "test.png");

    const productId = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${seller2Token}`);

    expect(res.status).toBe(403);
  });

  it("SELLER → create product without image", async () => {
    const token = await createAndLoginUser({
      email: "seller1@test.com",
      password: "Test123@",
      fullName: "Seller 1",
      role: "seller",
    });

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .field("name", "Test Product")
      .field("description", "Desc")
      .field("category", "Food")
      .field("pricing", JSON.stringify([{ minQty: 1, price: 100 }]));

    expect(res.status).toBe(400);
  });
  it("CUSTOMER → cannot create product", async () => {
    const token = await createAndLoginUser({
      email: "customer1@test.com",
      password: "Test123@",
      fullName: "Customer 1",
      role: "customer",
    });

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .attach("image", Buffer.from("fake"), "test.png")
      .field("name", "Test")
      .field("description", "Desc")
      .field("category", "Food")
      .field("pricing", JSON.stringify([{ minQty: 1, price: 100 }]));

    expect(res.status).toBe(403);
  });
  it("CUSTOMER → cannot access seller products", async () => {
    const token = await createAndLoginUser({
      email: "customer2@test.com",
      password: "Test123@",
      fullName: "Customer 2",
      role: "customer",
    });

    const res = await request(app)
      .get("/api/products/seller")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
