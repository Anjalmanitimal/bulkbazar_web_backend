import { Request, Response } from "express";
import { ZodError } from "zod";
import { registerDto, loginDto } from "../dtos/user.dto";
import {
  registerUserService,
  loginUserService,
} from "../services/auth.service";
console.log("🔥 ACTIVE DTO: NO username, NO confirmPassword");

/* ================= REGISTER ================= */
export const register = async (req: Request, res: Response) => {
  console.log("RAW REQ BODY =>", req.body);
  try {
    const data = registerDto.parse(req.body);
    const user = await registerUserService(data);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues.map((e) => e.message).join(", "),
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

/* ================= LOGIN ================= */
export const login = async (req: Request, res: Response) => {
  try {
    const data = loginDto.parse(req.body);
    const result = await loginUserService(data.email, data.password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: result.token,
      data: result.user,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues.map((e) => e.message).join(", "),
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || "Invalid credentials",
    });
  }
};
