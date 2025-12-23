import express from "express";
import chatController from "../../controllers/chat/chatController.js";
import {
  authenticateJWT,
  authorizeRole,
} from "../../middlewares/authMiddleware.js";
import upload from "../../middlewares/multer.js";

const router = express.Router();

router.use(authenticateJWT, authorizeRole("owner", "shelter"));

router.get("/rooms", chatController.getChatRooms);
router.get("/rooms/:roomId/messages", chatController.getRoomMessages);
router.post(
  "/rooms/:roomId/messages",
  upload.single("image"),
  chatController.sendMessage
);
router.delete("/messages/:messageId", chatController.deleteMessage);
router.post("/messages/:messageId/reaction", chatController.toggleReaction);
router.patch("/rooms/:roomId/block", chatController.blockRoom);
router.patch("/rooms/:roomId/close", chatController.closeRoom);
router.patch("/messages/:messageId/delivered", chatController.markAsDelivered);
router.patch("/messages/:messageId/read", chatController.markAsRead);
router.patch("/rooms/:roomId/wallpaper", chatController.updateWallpaper);
router.post(
  "/rooms/:roomId/wallpaper/upload",
  upload.single("wallpaper"),
  chatController.uploadWallpaper
);

export default router;
