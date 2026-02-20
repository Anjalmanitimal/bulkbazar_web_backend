import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.route";
import path from "path";
import profileRoutes from "./routes/profile.route";
import adminUserRoutes from "./routes/admin/admin.user.route";
import productRoutes from "./routes/product.route";

dotenv.config();

const app = express();

/* ✅ CORS – REQUIRED FOR WEB */
app.use(
  cors({
    origin: ["http://localhost:3000"], // web frontend
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/api", profileRoutes);
app.use("/api/products", productRoutes);

export default app;
