import request from "supertest";
import app from "../../app";

export const registerUser = async (user: any) => {
  return request(app).post("/api/auth/register").send(user);
};

export const loginUser = async (email: string, password: string) => {
  return request(app).post("/api/auth/login").send({ email, password });
};

export const createAndLoginUser = async (user: any) => {
  await registerUser(user);
  const res = await loginUser(user.email, user.password);
  return res.body.token;
};
