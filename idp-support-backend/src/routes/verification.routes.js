import express from "express";
import {
  createVerification,
  getMyVerifications,
  getVerificationById,
  getVerificationsList,
  updateVerificationStatus,
} from "../controllers/verification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { uploadVerificationFiles } from "../middleware/uploadVerification.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("IDP"),
  uploadVerificationFiles,
  createVerification
);

router.get(
  "/",
  authenticate,
  authorizeRoles("Moderator"),
  getVerificationsList
);

router.get(
  "/personal-verifications",
  authenticate,
  authorizeRoles("IDP"),
  getMyVerifications
);

router.get("/:id", getVerificationById);

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("Moderator"),
  updateVerificationStatus
);

export default router;
