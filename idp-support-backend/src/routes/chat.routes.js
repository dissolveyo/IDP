import express from "express";
import {
  createChat,
  getChatById,
  getMessages,
  getChats,
  getModeratorRequestedChats,
  markChatInModeration,
} from "../controllers/chat.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", authenticate, authorizeRoles("IDP"), createChat);
router.get(
  "/",
  authenticate,
  authorizeRoles("IDP", "Moderator", "Landlord"),
  getChats
);
router.get(
  "/moderator-requested",
  authenticate,
  authorizeRoles("Moderator"),
  getModeratorRequestedChats
);
router.get(
  "/:id",
  authenticate,
  authorizeRoles("IDP", "Moderator", "Landlord"),
  getChatById
);
router.patch(
  "/:id/in-moderation",
  authenticate,
  authorizeRoles("Moderator"),
  markChatInModeration
);
router.get("/messages/:chatId", authenticate, getMessages);

export default router;
