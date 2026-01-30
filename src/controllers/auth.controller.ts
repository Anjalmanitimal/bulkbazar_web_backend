import { Request, Response } from "express";
import { ZodError } from "zod";
import { registerDto, loginDto } from "../dtos/user.dto";
import {
  registerUserService,
  loginUserService,
} from "../services/auth.service";
import { HttpError } from "../errors/http.error";
import { UserModel } from "../models/user.model";

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

export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    if (!req.file) {
      throw new HttpError(400, "No file uploaded");
    }

    const imagePath = `/uploads/profile/${req.file.filename}`;

    // ✅ FETCH FULL USER FROM DB
    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    user.profileImage = imagePath;
    await user.save();

    return res.json({
      success: true,
      message: "Profile image uploaded successfully",
      data: {
        profileImage: imagePath,
      },
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    return res.json({
      success: true,
      data: {
        fullName: user.fullName, // ✅ CORRECT
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};
