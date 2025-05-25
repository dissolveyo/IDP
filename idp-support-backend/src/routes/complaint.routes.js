import express from "express";
import {
  createComplaint,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
} from "../controllers/complaint.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createComplaint);
router.get("/:id", getComplaintById);
router.get("/", authenticate, getAllComplaints);
router.put("/:id/status", updateComplaintStatus);

export default router;
