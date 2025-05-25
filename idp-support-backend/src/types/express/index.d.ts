import { UserRole } from "../../enums/UserRole";

declare namespace Express {
  interface Request {
    user?: {
      id: string;
      role: UserRole;
    };
  }
}