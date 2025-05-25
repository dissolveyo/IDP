import path from "path";
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { UserRole } from "../enums/UserRole.js";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
  };
}

const storage = multer.diskStorage({
  destination: "uploads/avatars/",
  filename: (req: AuthenticatedRequest, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}${ext}`);
  },
});

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 500 * 1024 }, // 500KB
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const allowed = ["image/jpeg", "image/png"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});