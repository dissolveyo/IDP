import express from "express";
import { getAnalyticsByType } from "../controllers/analytics.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/:type",
  authenticate,
  authorizeRoles("SuperUser"),
  getAnalyticsByType
);

export default router;
