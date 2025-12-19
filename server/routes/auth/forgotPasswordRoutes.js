import express from "express";
import forgotPasswordController from "../../controllers/auth/forgotPasswordController.js";

const router = express.Router();

router.post("/request", forgotPasswordController.requestOTP);
router.post("/verify-otp", forgotPasswordController.verifyOTP);
router.post("/reset", forgotPasswordController.resetPassword);
router.post("/resend-otp", forgotPasswordController.resendOTP);

export default router;
