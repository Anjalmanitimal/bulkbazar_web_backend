import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  createUser,
  updateUserById,
} from "../repositories/user.repository";
import { HttpError } from "../errors/http.error";
import { UserModel } from "../models/user.model";
import { CreateUserInput } from "../types/user.types";
import { sendEmail } from "../configs/email";

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
/* ================= REQUEST PASSWORD RESET ================= */
export const requestPasswordResetService = async (email: string) => {
  const user = await findUserByEmail(email);

  // Don't reveal if email exists
  if (!user) return;

  const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });

  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await sendEmail(
    user.email,
    "Reset Your Password",
    `
      <h3>Reset Password</h3>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link expires in 1 hour.</p>
    `,
  );
};

/* ================= RESET PASSWORD ================= */
export const resetPasswordService = async (
  token: string,
  newPassword: string,
) => {
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    // 🔐 Strong password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      throw new HttpError(
        400,
        "Password must contain uppercase, lowercase, number and special character",
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await updateUserById(decoded.id, {
      password: hashedPassword,
    });

    return true;
  } catch (error) {
    throw new HttpError(400, "Invalid or expired token");
  }
};
