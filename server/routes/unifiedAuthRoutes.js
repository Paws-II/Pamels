import express from "express";
import unifiedAuthController from "../controllers/unifiedAuthController.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", unifiedAuthController.login);

router.post("/logout", authenticateJWT, unifiedAuthController.logout);

export default router;
