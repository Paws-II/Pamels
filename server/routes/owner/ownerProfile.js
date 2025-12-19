import express from "express";
import ownerProfileController from "../../controllers/owner/ownerProfile.controller.js";
import {
  authenticateJWT,
  authorizeRole,
} from "../../middlewares/authMiddleware.js";
import upload from "../../middlewares/multer.js";

const router = express.Router();

router.use(authenticateJWT, authorizeRole("owner"));

router.get("/", ownerProfileController.getProfile);
router.put("/", ownerProfileController.updateProfile);
router.put(
  "/avatar",
  upload.single("avatar"),
  ownerProfileController.updateAvatar
);

export default router;
