import express from "express";

import User from "../models/user.model.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { uploadAvatar } from "../middleware/uploadAvatar.middleware.js";
import { uploadDocument } from "../middleware/uploadDocument.middleware.js";
import {
  activatePassword,
  createModerator,
  deleteModeratorById,
  getModeratorById,
  getModerators,
  login,
  register,
  resendActivatePasswordLink,
  updateModeratorBySuperUser,
  updateProfile,
  verifySession,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/session", authenticate, verifySession);
router.patch("/profile", authenticate, updateProfile);

router.post(
  "/moderators",
  authenticate,
  authorizeRoles("SuperUser"),
  createModerator
);

router.get(
  "/moderators",
  authenticate,
  authorizeRoles("SuperUser"),
  getModerators
);

router.get(
  "/moderators/:id",
  authenticate,
  authorizeRoles("SuperUser"),
  getModeratorById
);

router.put(
  "/moderators/:id",
  authenticate,
  authorizeRoles("SuperUser"),
  updateModeratorBySuperUser
);

router.post(
  "/moderators/:id/resend-activation",
  authenticate,
  authorizeRoles("SuperUser"),
  resendActivatePasswordLink
);

router.delete(
  "/moderators/:id",
  authenticate,
  authorizeRoles("SuperUser"),
  deleteModeratorById
);

router.post("/activate-password/:token", activatePassword);

router.post(
  "/avatar",
  authenticate,
  uploadAvatar.single("avatar"),
  async (req, res) => {
    const user = await User.findById(req.user.id);
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    user.updatedAt = new Date();
    await user.save();
    const { password, documents, ...safeUser } = user.toObject();
    res.json({ user: safeUser });
  }
);

router.post(
  "/documents",
  authenticate,
  uploadDocument.array("documents"),
  async (req, res) => {
    const files = req.files.map((f) => ({
      filename: f.originalname,
      path: f.path,
      mimetype: f.mimetype,
    }));

    const user = await User.findById(req.user.id);
    user.documents.push(...files.map((f) => f.path));
    user.updatedAt = new Date();
    await user.save();

    res.json({ documents: files });
  }
);

export default router;
