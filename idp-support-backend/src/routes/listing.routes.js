import express from "express";
import {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  getUserListings,
  toggleListingStatus,
  getAllActiveListings,
  activateListing,
  suspendListing,
} from "../controllers/listing.controller.js";
import { uploadListingImages } from "../middleware/uploadListingsImages.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("Landlord"),
  uploadListingImages.array("photos", 7),
  createListing
);
router.get("/", getAllListings);
router.get(
  "/personal-listings",
  authenticate,
  authorizeRoles("Landlord"),
  getUserListings
);
router.get("/:id", getListingById);
router.put("/:id", authenticate, authorizeRoles("Landlord"), updateListing);
router.delete("/:id", authenticate, authorizeRoles("Landlord"), deleteListing);
router.get("/listings/active", authenticate, getAllActiveListings);
router.patch(
  "/:id/toggle-status",
  authenticate,
  authorizeRoles("Landlord"),
  toggleListingStatus
);

router.patch(
  "/:id/suspend",
  authenticate,
  authorizeRoles("Moderator"),
  suspendListing
);

router.patch(
  "/:id/activate",
  authenticate,
  authorizeRoles("Moderator"),
  activateListing
);

export default router;
