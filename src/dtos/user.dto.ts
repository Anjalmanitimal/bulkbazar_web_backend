import { z } from "zod";

/* REGISTER DTO */
export const registerDto = z
  .object({
    email: z.string().email(),
    username: z.string().min(3),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterDto = z.infer<typeof registerDto>;

/* LOGIN DTO */
export const loginDto = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginDto = z.infer<typeof loginDto>;
