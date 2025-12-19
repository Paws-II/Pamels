import express from "express";
import ownerSecurityController from "../../controllers/owner/ownerSecurity.controller.js";
import {
  authenticateJWT,
  authorizeRole,
} from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticateJWT, authorizeRole("owner"));

router.post("/request-otp", ownerSecurityController.requestPasswordChangeOTP);
router.post("/verify-otp", ownerSecurityController.verifyPasswordChangeOTP);
router.post("/change-password", ownerSecurityController.changePassword);

export default router;
