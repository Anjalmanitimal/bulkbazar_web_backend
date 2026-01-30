import { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/user.model";
import { HttpError } from "../errors/http.error";

/* ================= GET PROFILE ================= */
export const getProfile = async (req: any, res: Response) => {
  const user = await UserModel.findById(req.user.userId).select(
    "name email role profileImage",
  );

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  res.json(user);
};

/* ================= UPLOAD PROFILE IMAGE ================= */
export const uploadProfileImage = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      throw new HttpError(400, "No image uploaded");
    }

    const imagePath = `/uploads/profile/${req.file.filename}`;

    const user = await UserModel.findByIdAndUpdate(
      req.user.userId, // ✅ FIX HERE
      { profileImage: imagePath },
      { new: true },
    );

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    res.status(200).json({
      success: true,
      message: "Profile image uploaded",
      profileImage: imagePath,
    });
  } catch (error) {
    next(error);
  }
};
