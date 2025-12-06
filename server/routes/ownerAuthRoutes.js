import express from "express";
import ownerAuthController from "../controllers/ownerAuthController.js";
import {
  authenticateJWT,
  authorizeRole,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/check-email", ownerAuthController.checkEmail);
router.post("/signup", ownerAuthController.signup);
router.post("/verify-otp", ownerAuthController.verifyOTP);
router.post("/resend-otp", ownerAuthController.resendOTP);

router.get(
  "/profile",
  authenticateJWT,
  authorizeRole("owner"),
  ownerAuthController.getProfile
);

router.post("/logout", authenticateJWT, ownerAuthController.logout);

router.get("/test", authenticateJWT, authorizeRole("owner"), (req, res) => {
  res.json({
    success: true,
    message: "Owner JWT authentication is working!",
    user: req.user.email,
  });
});

export default router;
