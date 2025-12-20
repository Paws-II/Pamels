import express from "express";
import petController from "../../controllers/shelter/pet.js";
import {
  authenticateJWT,
  authorizeRole,
} from "../../middlewares/authMiddleware.js";
import upload from "../../middlewares/multer.js";

const router = express.Router();

router.post(
  "/",
  authenticateJWT,
  authorizeRole("shelter"),
  upload.array("images", 5),
  petController.createPet
);

router.get(
  "/",
  authenticateJWT,
  authorizeRole("shelter"),
  petController.getShelterPets
);

router.get(
  "/:petId",
  authenticateJWT,
  authorizeRole("shelter"),
  petController.getPetById
);

router.put(
  "/:petId",
  authenticateJWT,
  authorizeRole("shelter"),
  upload.array("images", 5),
  petController.updatePet
);

router.delete(
  "/:petId",
  authenticateJWT,
  authorizeRole("shelter"),
  petController.deletePet
);

export default router;
