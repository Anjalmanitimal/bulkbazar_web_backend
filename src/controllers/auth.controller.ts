import { Request, Response } from "express";
import { ZodError } from "zod";
import { registerDto, loginDto } from "../dtos/user.dto";
import {
  registerUserService,
  loginUserService,
  updateProfileService,
} from "../services/auth.service";
import { HttpError } from "../errors/http.error";
import { UserModel } from "../models/user.model";
import { UserRole } from "../types/user.types";

console.log("🔥 ACTIVE DTO: NO username, NO confirmPassword");

/* ================= REGISTER ================= */
export const register = async (req: Request, res: Response) => {
  console.log("RAW REQ BODY =>", req.body);

  try {
    const data = registerDto.parse(req.body);

    /**
     * 🔐 ADMIN BOOTSTRAP (SPRINT PURPOSE)
     * Only the email defined in .env becomes ADMIN
     * Everyone else is CUSTOMER
     */
    let role: UserRole;

    // Admin bootstrap
    if (data.email === process.env.ADMIN_EMAIL) {
      role = UserRole.ADMIN;
    }
    // use role from frontend
    else if (data.role === UserRole.SELLER) {
      role = UserRole.SELLER;
    } else {
      role = UserRole.CUSTOMER;
    }

    const user = await registerUserService({
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      role,
    });

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

    return res.status(400).json({
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

    return res.status(400).json({
      success: false,
      message: error.message || "Invalid credentials",
    });
  }
};

/* ================= GET PROFILE ================= */
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
        fullName: user.fullName,
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

/* ================= UPDATE PROFILE ================= */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    // 🔐 User can update ONLY their own profile
    if (req.user?.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own profile",
      });
    }

    const updateData: any = {
      fullName: req.body.fullName,
    };

    if (req.file) {
      updateData.profileImage = `/uploads/profile/${req.file.filename}`;
    }

    const updatedUser = await updateProfileService(userId, updateData);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Profile update failed",
    });
  }
};

/* ================= UPLOAD PROFILE IMAGE ================= */
export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    if (!req.file) {
      throw new HttpError(400, "No file uploaded");
    }

    const imagePath = `/uploads/profile/${req.file.filename}`;

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
