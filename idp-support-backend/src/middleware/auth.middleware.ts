import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../enums/UserRole.js';

interface JwtPayload {
  id: string;
  role: UserRole;
}

export interface AuthUser {
  id: string;
  role: string;
}

export interface IGetUserAuthInfoRequest extends Request {
  user: AuthUser;
}


export const authenticate = (
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res
        .status(401)
        .json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }

    return res
      .status(401)
      .json({ message: 'Invalid token', code: 'INVALID_TOKEN' });
  }
};
