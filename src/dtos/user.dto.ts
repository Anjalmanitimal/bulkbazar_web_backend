import { z } from "zod";
console.log("✅ CORRECT user.dto.ts LOADED");

/* ================= REGISTER DTO ================= */
export const registerDto = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
  role: z.enum(["seller", "customer"]),
});

export type RegisterDto = z.infer<typeof registerDto>;

/* ================= LOGIN DTO ================= */
export const loginDto = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginDto = z.infer<typeof loginDto>;
