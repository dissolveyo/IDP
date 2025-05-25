import express from "express";
import {
  createRating,
  getRatingsByListing,
  deleteRating,
  getIsAllowedToLeaveRating,
  updateRating,
} from "../controllers/rating.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", authenticate, authorizeRoles("IDP"), createRating);
router.put("/:id", authenticate, authorizeRoles("IDP"), updateRating);
router.get("/listing/:listingId", authenticate, getRatingsByListing);
router.post(
  "/allowed",
  authenticate,
  authorizeRoles("IDP"),
  getIsAllowedToLeaveRating
);
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("IDP", "Moderator"),
  deleteRating
);

export default router;
