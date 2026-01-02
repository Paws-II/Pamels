import express from "express";
import ownerAdoptedPetsController from "../../controllers/owner/ownerAdoptedPets.js";
import {
  authenticateJWT,
  authorizeRole,
} from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticateJWT, authorizeRole("owner"));

router.get("/", ownerAdoptedPetsController.getAdoptedPets);

router.get("/:petId", ownerAdoptedPetsController.getAdoptedPetDetails);

export default router;
