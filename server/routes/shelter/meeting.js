import express from "express";
import meetingController from "../../controllers/shelter/meetingController.js";
import {
  authenticateJWT,
  authorizeRole,
} from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticateJWT);

router.get(
  "/owner",
  authorizeRole("owner"),
  meetingController.getMeetingsByOwner
);
router.use(authorizeRole("shelter"));

router.get("/eligible-owners", meetingController.getEligibleOwners);

router.get("/", meetingController.getMeetings);

router.post("/", meetingController.createMeeting);

router.patch("/:meetingId", meetingController.updateMeeting);

router.patch("/:meetingId/cancel", meetingController.cancelMeeting);

router.patch("/:meetingId/complete", meetingController.markComplete);

router.delete("/:meetingId", meetingController.deleteMeeting);

export default router;
