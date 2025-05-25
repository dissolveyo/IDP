import { Request, Response, NextFunction } from "express";
import { UserRole } from "../enums/UserRole.js";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
  };
}

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};