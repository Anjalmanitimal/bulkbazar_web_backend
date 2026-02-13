import { z } from "zod";
import { UserRole } from "../types/user.types";

console.log("✅ CORRECT user.dto.ts LOADED");

/* ================= REGISTER DTO (PUBLIC) ================= */
export const registerDto = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullname: z.string().min(2, "Full name is required"),
  role: z.nativeEnum(UserRole).optional(), // public users only
});

export type RegisterDto = z.infer<typeof registerDto>;

/* ================= LOGIN DTO ================= */
export const loginDto = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginDto = z.infer<typeof loginDto>;

/* ================= ADMIN CREATE USER DTO ================= */
export const CreateUserDTO = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullname: z.string().min(2),
  role: z.enum(["seller", "customer", "admin"]),
  imageUrl: z.string().optional(),
});

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

/* ================= ADMIN UPDATE USER DTO ================= */
export const UpdateUserDTO = z.object({
  email: z.string().email().optional(),
  fullname: z.string().min(2).optional(),
  role: z.enum(["seller", "customer", "admin"]).optional(),
  imageUrl: z.string().optional(),
});

export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;
