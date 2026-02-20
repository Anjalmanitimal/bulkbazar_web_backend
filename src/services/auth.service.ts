import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser } from "../repositories/user.repository";
import { HttpError } from "../errors/http.error";
import { UserModel } from "../models/user.model";
import { CreateUserInput } from "../types/user.types";

/* ================= REGISTER ================= */
export const registerUserService = async (data: CreateUserInput) => {
  const existingUser = await findUserByEmail(data.email);

  if (existingUser) {
    throw new HttpError(409, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await createUser({
    email: data.email,
    password: hashedPassword,
    fullName: data.fullName,
    role: data.role, // ✅ now always defined
  });

  return user;
};

/* ================= LOGIN ================= */
export const loginUserService = async (email: string, password: string) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new HttpError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new HttpError(401, "Invalid credentials");
  }

  const token = jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1d",
    },
  );

  return {
    token,
    user,
  };
};

export const updateProfileService = async (
  userId: string,
  data: {
    fullName?: string;
    profileImage?: string;
  },
) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error("User not found");

  if (data.fullName) user.fullName = data.fullName;
  if (data.profileImage) user.profileImage = data.profileImage;

  await user.save();

  return user;
};
