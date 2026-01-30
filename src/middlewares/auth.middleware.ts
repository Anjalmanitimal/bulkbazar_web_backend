import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs";
import { HttpError } from "../errors/http.error";

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

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpError(401, "Unauthorized: Invalid token format");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new HttpError(401, "Unauthorized: Token missing");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role?: string;
    };

    if (!decoded?.userId) {
      throw new HttpError(401, "Unauthorized: Token verification failed");
    }

    // Attach decoded info (NO DB CALL)
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    return next();
  } catch (err: any) {
    return res.status(err.statusCode || 401).json({
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
