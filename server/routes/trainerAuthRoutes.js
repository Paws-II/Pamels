import express from "express";
import trainerAuthController from "../controllers/trainerAuthController.js";
import {
  authenticateJWT,
  authorizeRole,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/check-email", trainerAuthController.checkEmail);
router.post("/signup", trainerAuthController.signup);
router.post("/verify-otp", trainerAuthController.verifyOTP);
router.post("/resend-otp", trainerAuthController.resendOTP);

router.get(
  "/profile",
  authenticateJWT,
  authorizeRole("trainer"),
  trainerAuthController.getProfile
);

router.post("/logout", authenticateJWT, trainerAuthController.logout);

router.get("/test", authenticateJWT, authorizeRole("trainer"), (req, res) => {
  res.json({
    success: true,
    message: "Trainer JWT authentication is working!",
    user: req.user.email,
  });
});

export default router;
