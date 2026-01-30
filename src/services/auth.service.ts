import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser } from "../repositories/user.repository";

export const registerUserService = async (data: any) => {
  const existingUser = await findUserByEmail(data.email);
  if (existingUser) throw new Error("Email already exists");

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await createUser({
    email: data.email,
    password: hashedPassword,
    fullName: data.fullName,
    role: data.role,
  });

  return user;
};

export const loginUserService = async (email: string, password: string) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  console.log("LOGIN USER ID =>", user._id.toString());
  console.log("JWT_SECRET (LOGIN) =>", process.env.JWT_SECRET);

  const token = jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" },
  );

  console.log("GENERATED TOKEN =>", token);

  return { token, user };
};
