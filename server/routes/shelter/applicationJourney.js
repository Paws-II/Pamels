import express from "express";
import applicationJourneyController from "../../controllers/shelter/applicationJourney.js";
import {
  authenticateJWT,
  authorizeRole,
} from "../../middlewares/authMiddleware.js";
import upload from "../../middlewares/multer.js";

const router = express.Router();

router.get(
  "/owner-applications",
  authenticateJWT,
  authorizeRole("owner"),
  applicationJourneyController.getOwnerApplications
);

router.get(
  "/owner/:applicationId",
  authenticateJWT,
  authorizeRole("owner"),
  applicationJourneyController.getOwnerJourney
);

router.get(
  "/submitted",
  authenticateJWT,
  authorizeRole("shelter"),
  applicationJourneyController.getSubmittedApplications
);

router.get(
  "/:applicationId",
  authenticateJWT,
  authorizeRole("shelter"),
  applicationJourneyController.getJourneyDetails
);

router.post(
  "/:applicationId/video-verification",
  authenticateJWT,
  authorizeRole("shelter"),
  applicationJourneyController.updateVideoVerificationStatus
);

router.post(
  "/:applicationId/final-approval",
  authenticateJWT,
  authorizeRole("shelter"),
  applicationJourneyController.updateFinalStatus
);

router.post(
  "/:applicationId/upload-site-photos",
  authenticateJWT,
  authorizeRole("shelter"),
  upload.array("sitePhotos", 2),
  applicationJourneyController.uploadSitePhotos
);

export default router;
