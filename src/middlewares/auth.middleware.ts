import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { HttpError } from "../errors/http.error";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role?: string;
      };
    }
  }
}

/**
 * ============================
 * AUTHORIZATION MIDDLEWARE
 * ============================
 */
export const authorizedMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpError(401, "Unauthorized: Token missing or invalid");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded || !decoded.id) {
      throw new HttpError(401, "Unauthorized: Invalid token");
    }

    req.user = {
      userId: decoded.id as string,
      role: decoded.role as string | undefined,
    };

    return next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: err.message || "Unauthorized",
    });
  }
};

/**
 * ============================
 * ADMIN-ONLY MIDDLEWARE
 * ============================
 * ⚠️ Does NOT affect seller/customer routes
 * ⚠️ Only used in /api/admin/**
 */
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }

  next();
};
