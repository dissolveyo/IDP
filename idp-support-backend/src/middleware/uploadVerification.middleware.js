import multer from "multer";
import path from "path";
import fs from "fs";

const allowedTypes = ["image/jpeg", "image/png"];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Дозволено лише .jpg та .png"), false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join("uploads", "verifications");

    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const uploadVerificationFiles = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).fields([
  { name: "certificate", maxCount: 1 },
  { name: "passport_front", maxCount: 1 },
  { name: "passport_back", maxCount: 1 },
]);
