import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = path.join("uploads", "listings");
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const uploadListingImages = multer({
  storage,
  limits: { files: 7 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only .jpg and .png images are allowed"));
    }
    cb(null, true);
  },
});
