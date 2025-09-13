// app/middleware/auth.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const authMiddleware = (roles: string[] = []) : RequestHandler => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
       res.status(401).json({ message: "No token provided" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
      req.user = decoded;

      // ⬅ If roles array is not empty, check if user's role is allowed
      if (roles.length > 0 && !roles.includes(decoded.role)) {
         res.status(403).json({ message: "Forbidden: insufficient permissions" });
          return;
      }

      next();
    } catch (err) {
       res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
  };
};
