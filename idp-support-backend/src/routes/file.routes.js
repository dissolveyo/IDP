import express from "express";
import { serveVerificationsFiles } from "../controllers/file.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/verification/:filename",
  authenticate,
  authorizeRoles("Moderator"),
  serveVerificationsFiles
);

export default router;
