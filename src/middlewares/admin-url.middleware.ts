import { Request, Response, NextFunction } from "express";

export const adminUrlMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Sprint-only rule:
  // If URL starts with /admin, allow as admin
  if (req.originalUrl.startsWith("/api/admin")) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Admin route only",
  });
};
