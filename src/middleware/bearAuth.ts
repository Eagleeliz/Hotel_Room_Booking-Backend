import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { userRole } from "../drizzle/schema"; 

dotenv.config();

// JWT payload type
type DecodedToken = {
  userId: number;
  email: string;
  role: typeof userRole.enumValues[number]; // ✅ 'user' | 'admin'
  firstName: string;
  lastName: string;
  exp: number;
};

// Extend Express Request to hold user
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

// Token verification
export const verifyToken = async (
  token: string,
  secret: string
): Promise<DecodedToken | null> => {
  try {
    const decoded = jwt.verify(token, secret) as DecodedToken;
    return decoded;
  } catch (error) {
    return null;
  }
};

// Role-based middleware factory
export const authMiddleware = (
  requiredRole: typeof userRole.enumValues[number] | "any"
): ((req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ error: "Authorization header is missing" });
      return;
    }

    const decodedToken = await verifyToken(
      token,
      process.env.JWT_SECRET as string
    );

    if (!decodedToken) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const userType = decodedToken.role;

    if (requiredRole === "any" || userType === requiredRole) {
      req.user = decodedToken;
      next();
    } else {
      res.status(403).json({
        error: "Forbidden: You do not have permission to access this resource"
      });
    }
  };
};

// Use these in routes
export const adminOnly = authMiddleware("admin");
export const userOnly = authMiddleware("user");
export const anyAuthenticatedUser = authMiddleware("any");
