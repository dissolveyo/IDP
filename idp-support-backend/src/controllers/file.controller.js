import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";

const PHOTO_JWT_SECRET = process.env.JWT_SECRET_PHOTOS;
const PHOTO_UPLOADS_PATH = path.join(process.cwd(), "uploads", "verifications");

const getMimeType = (ext) => {
  switch (ext.toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
};

export const serveVerificationsFiles = (req, res) => {
  const { filename } = req.params;
  const { token } = req.query;

  if (!token) return res.status(401).send("Access denied");

  try {
    const payload = jwt.verify(token, PHOTO_JWT_SECRET);

    const expectedFilename = path.basename(filename);
    if (payload.filename !== expectedFilename) {
      return res.status(403).send("Invalid token for this file");
    }

    const filePath = path.join(PHOTO_UPLOADS_PATH, expectedFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found");
    }

    const ext = path.extname(filePath);
    const mimeType = getMimeType(ext);
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.sendFile(filePath);
  } catch (e) {
    return res.status(401).send("Invalid or expired token");
  }
};
