  import { Schema, model } from "mongoose";

  const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    role: { type: String, enum: ["seller", "customer"], required: true },
    profileImage: { type: String, default: null },
  });

  export const UserModel = model("User", userSchema);
