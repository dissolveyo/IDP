import multer, { FileFilterCallback } from "multer";
import fs from "fs";
import path from "path";
import { Request } from "express";

const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    const userId = (req as any).user?.id;
    const userDir = path.join("uploads", "documents", userId);
    fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const uploadDocument = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const isPdf = file.mimetype === "application/pdf";
    cb(null, isPdf);
  },
});
