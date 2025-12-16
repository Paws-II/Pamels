import express from "express";
import shelterAuthController from "../controllers/shelterAuthController.js";
import {
  authenticateJWT,
  authorizeRole,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/check-email", shelterAuthController.checkEmail);
router.post("/signup", shelterAuthController.signup);
router.post("/verify-otp", shelterAuthController.verifyOTP);
router.post("/resend-otp", shelterAuthController.resendOTP);

router.get(
  "/profile",
  authenticateJWT,
  authorizeRole("shelter"),
  shelterAuthController.getProfileWithAuth
);

router.post("/logout", authenticateJWT, shelterAuthController.logout);

router.get("/test", authenticateJWT, authorizeRole("shelter"), (req, res) => {
  res.json({
    success: true,
    message: "Shelter JWT authentication is working!",
    user: req.user.email,
  });
});

export default router;
