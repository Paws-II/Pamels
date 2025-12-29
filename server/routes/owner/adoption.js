import express from "express";
import adoptionController from "../../controllers/owner/adoption.js";
import {
  authenticateJWT,
  authorizeRole,
} from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticateJWT, authorizeRole("owner"));

router.get("/species", adoptionController.getAvailableSpecies);
router.get("/breeds/:species", adoptionController.getBreedsBySpecies);
router.get("/pets", adoptionController.getAvailablePets);
router.get("/pets/:petId", adoptionController.getPetDetails);
router.post("/apply", adoptionController.submitApplication);
router.get("/my-applications", adoptionController.getMyApplications);
router.get(
  "/application/:applicationId",
  adoptionController.getApplicationDetail
);
router.get("/archived", adoptionController.getArchivedApplications);
router.delete(
  "/application/:applicationId/delete",
  adoptionController.deleteApplication
);
router.post("/withdraw/:applicationId", adoptionController.withdrawApplication);
export default router;
