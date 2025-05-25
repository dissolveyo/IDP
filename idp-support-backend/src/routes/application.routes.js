import express from "express";
import {
  createApplication,
  getApplicationById,
  updateApplication,
  deleteApplication,
  hasPendingApplication,
  getUserApplications,
  approveOrRejectApplication,
} from "../controllers/application.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", authenticate, authorizeRoles("IDP"), createApplication);
router.get(
  "/",
  authenticate,
  authorizeRoles("IDP", "Landlord"),
  getUserApplications
);
router.get(
  "/has-pending/:listingId",
  authenticate,
  authorizeRoles("IDP"),
  hasPendingApplication
);
router.patch("/:id/status", approveOrRejectApplication);
router.get("/:id", getApplicationById);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);

export default router;
