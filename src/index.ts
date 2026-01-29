import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.route";
import path from "path";

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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

console.log("MONGO URI =>", process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`),
    );
  })
  .catch(console.error);
