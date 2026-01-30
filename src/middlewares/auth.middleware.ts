import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../errors/http.error";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

console.log("JWT_SECRET (MIDDLEWARE) =>", JWT_SECRET);

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

export const authorizedMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER =>", authHeader);
    console.log("JWT_SECRET (MIDDLEWARE) =>", JWT_SECRET);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpError(401, "Unauthorized: Invalid token format");
    }

    const token = authHeader.split(" ")[1];
    console.log("TOKEN (MIDDLEWARE) =>", token);

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("DECODED (MIDDLEWARE) =>", decoded);

    const payload = decoded as any;

    if (!payload?.id) {
      throw new HttpError(401, "Unauthorized: Token verification failed");
    }

    req.user = {
      userId: payload.id,
      role: payload.role,
    };

    return next();
  } catch (err: any) {
    console.error("JWT VERIFY ERROR =>", err);

    return res.status(401).json({
      success: false,
      message: err.message || "Unauthorized",
    });
  }
};

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    if (req.user.role !== "ADMIN") {
      throw new HttpError(403, "Forbidden: Admin only");
    }

    return next();
  } catch (err: any) {
    return res.status(err.statusCode || 403).json({
      success: false,
      message: err.message || "Forbidden",
    });
  }
};
