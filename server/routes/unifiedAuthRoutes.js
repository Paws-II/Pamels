import express from "express";
import unifiedAuthController from "../controllers/unifiedAuthController.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", unifiedAuthController.login);

router.post("/logout", authenticateJWT, unifiedAuthController.logout);

router.get("/google/owner", unifiedAuthController.googleOwnerAuth);
router.get("/google/shelter", unifiedAuthController.googleShelterAuth);
router.get("/google/login", unifiedAuthController.googleCommonAuth);
router.get("/google/callback", unifiedAuthController.googleCallback);

export default router;
