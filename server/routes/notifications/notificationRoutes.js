import express from "express";
import notificationController from "../../controllers/notifications/notification.js";
import { authenticateJWT } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticateJWT);

router.get("/", notificationController.getNotifications);
router.patch("/:notificationId/read", notificationController.markAsRead);
router.patch("/mark-all-read", notificationController.markAllAsRead);

export default router;
