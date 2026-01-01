import mongoose from "mongoose";
import AdoptionApplication from "../../models/adoption/AdoptionApplication.js";
import RoomMeetingPet from "../../models/rooms/RoomMeetingPet.js";
import OwnerProfile from "../../models/profiles/OwnerProfile.js";
import PetProfile from "../../models/profiles/PetProfile.js";
import ShelterLogin from "../../models/loginSystem/ShelterLogin.js";
import bcrypt from "bcryptjs";
import Notification from "../../models/notifications/Notification.js";
import CheckPetStatus from "../../models/petStatus/CheckPetStatus.js";
import cloudinary from "../../services/cloudinary.service.js";

const applicationJourneyController = {
  getSubmittedApplications: async (req, res) => {
    try {
      const shelterId = req.userId;

      const applications = await AdoptionApplication.find({
        shelterId,
        status: {
          $nin: ["rejected", "withdrawn"],
        },
      })
        .populate("petId", "name species breed coverImage")
        .populate("ownerId", "email")
        .sort({ createdAt: -1 })
        .lean();

      const applicationsWithProfiles = await Promise.all(
        applications.map(async (app) => {
          const ownerProfile = await OwnerProfile.findOne({
            ownerId: app.ownerId._id,
          })
            .select("name avatar")
            .lean();

          return {
            ...app,
            ownerProfile,
          };
        })
      );

      return res.json({
        success: true,
        data: applicationsWithProfiles,
      });
    } catch (error) {
      console.error("Get submitted applications error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch applications",
      });
    }
  },

  getJourneyDetails: async (req, res) => {
    try {
      const { applicationId } = req.params;
      const shelterId = req.userId;

      const application = await AdoptionApplication.findOne({
        _id: applicationId,
        shelterId,
      })
        .populate("petId", "name species breed coverImage")
        .populate("ownerId", "email")
        .lean();

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      const ownerProfile = await OwnerProfile.findOne({
        ownerId: application.ownerId._id,
      }).lean();

      const meetingDetails = await RoomMeetingPet.findOne({
        applicationId: application._id,
        ownerId: application.ownerId._id,
        petId: application.petId._id,
        shelterId: application.shelterId,
      }).lean();

      const journeySteps = generateJourneySteps(application, meetingDetails);

      return res.json({
        success: true,
        data: {
          application,
          ownerProfile,
          meetingDetails,
          journeySteps,
          isRejected: [
            "application-rejected",
            "video-verification-reject",
            "final-reject",
          ].includes(application.status),
        },
      });
    } catch (error) {
      console.error("Get journey details error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch journey details",
      });
    }
  },

  updateVideoVerificationStatus: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { applicationId } = req.params;
      const { status, password, rejectionReason } = req.body;
      const shelterId = req.userId;

      const shelter = await ShelterLogin.findById(shelterId).session(session);
      if (!shelter || !shelter.password) {
        await session.abortTransaction();
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, shelter.password);
      if (!isPasswordValid) {
        await session.abortTransaction();
        return res.status(401).json({
          success: false,
          message: "Incorrect password",
        });
      }

      const application = await AdoptionApplication.findOne({
        _id: applicationId,
        shelterId,
      }).session(session);

      if (!application) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      const meeting = await RoomMeetingPet.findOne({
        applicationId: application._id,
        ownerId: application.ownerId,
        petId: application.petId,
        shelterId: application.shelterId,
      }).session(session);

      if (!meeting || meeting.status !== "completed") {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Meeting must be completed before verification",
        });
      }

      if (status === "approve") {
        application.status = "video-verification-passed";
      } else if (status === "reject") {
        if (!rejectionReason || rejectionReason.trim() === "") {
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: "Rejection reason is required",
          });
        }
        application.status = "video-verification-reject";
        application.rejectionReason = rejectionReason;

        await CheckPetStatus.findOneAndUpdate(
          { petId: application.petId, applicationId: application._id },
          { activeOwnerId: null, applicationId: null },
          { session }
        );
      }

      await application.save({ session });

      const pet = await PetProfile.findById(application.petId)
        .session(session)
        .lean();

      await Notification.create(
        [
          {
            userId: application.ownerId,
            userModel: "OwnerLogin",
            type: "general",
            title:
              status === "approve"
                ? "Video Verification Passed"
                : "Video Verification Rejected",
            message:
              status === "approve"
                ? `Your video verification for ${pet?.name} has been approved`
                : `Your video verification for ${pet?.name} was rejected`,
            metadata: {
              applicationId: application._id,
              petId: application.petId,
              shelterId,
              rejectionReason: status === "reject" ? rejectionReason : null,
            },
          },
        ],
        { session }
      );

      await session.commitTransaction();

      if (req.app.locals.io) {
        req.app.locals.io
          .to(`user:${application.ownerId}`)
          .emit("application:status:updated", {
            applicationId: application._id,
            status: application.status,
            timestamp: Date.now(),
          });
      }

      return res.json({
        success: true,
        message: "Video verification status updated",
        data: application,
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Update video verification error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update status",
      });
    } finally {
      session.endSession();
    }
  },

  updateFinalStatus: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { applicationId } = req.params;
      const { status, password, rejectionReason } = req.body;
      const shelterId = req.userId;

      const shelter = await ShelterLogin.findById(shelterId).session(session);
      if (!shelter || !shelter.password) {
        await session.abortTransaction();
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, shelter.password);
      if (!isPasswordValid) {
        await session.abortTransaction();
        return res.status(401).json({
          success: false,
          message: "Incorrect password",
        });
      }

      const application = await AdoptionApplication.findOne({
        _id: applicationId,
        shelterId,
      }).session(session);

      if (!application) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      if (
        !application.siteVisitPhotos?.photo1?.url ||
        !application.siteVisitPhotos?.photo2?.url
      ) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Site visit photos must be uploaded first",
        });
      }

      const pet = await PetProfile.findById(application.petId).session(session);

      if (status === "approve") {
        application.status = "approved";

        pet.adoptionStatus = "adopted";
        pet.adoptedBy = application.ownerId;
        await pet.save({ session });

        await CheckPetStatus.findOneAndUpdate(
          { petId: application.petId },
          { activeOwnerId: null, applicationId: null },
          { session }
        );
      } else if (status === "reject") {
        if (!rejectionReason || rejectionReason.trim() === "") {
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: "Rejection reason is required",
          });
        }
        application.status = "final-reject";
        application.rejectionReason = rejectionReason;

        await CheckPetStatus.findOneAndUpdate(
          { petId: application.petId, applicationId: application._id },
          { activeOwnerId: null, applicationId: null },
          { session }
        );
      }

      await application.save({ session });

      await Notification.create(
        [
          {
            userId: application.ownerId,
            userModel: "OwnerLogin",
            type: "general",
            title:
              status === "approve"
                ? "Adoption Approved!"
                : "Application Rejected",
            message:
              status === "approve"
                ? `Congratulations! Your adoption of ${pet?.name} has been approved`
                : `Your application for ${pet?.name} was rejected`,
            metadata: {
              applicationId: application._id,
              petId: application.petId,
              shelterId,
              rejectionReason: status === "reject" ? rejectionReason : null,
            },
          },
        ],
        { session }
      );

      await session.commitTransaction();

      if (req.app.locals.io) {
        req.app.locals.io
          .to(`user:${application.ownerId}`)
          .emit("application:status:updated", {
            applicationId: application._id,
            status: application.status,
            timestamp: Date.now(),
          });
      }

      return res.json({
        success: true,
        message: "Final status updated",
        data: application,
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Update final status error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update status",
      });
    } finally {
      session.endSession();
    }
  },

  uploadSitePhotos: async (req, res) => {
    try {
      const { applicationId } = req.params;
      const shelterId = req.userId;
      const files = req.files;
      const geoLocations = JSON.parse(req.body.geoLocations || "[]");

      if (!files || files.length !== 2) {
        return res.status(400).json({
          success: false,
          message: "Exactly 2 photos are required",
        });
      }

      if (geoLocations.length !== 2) {
        return res.status(400).json({
          success: false,
          message: "Geo-location data missing",
        });
      }

      const application = await AdoptionApplication.findOne({
        _id: applicationId,
        shelterId,
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      if (application.status !== "video-verification-passed") {
        return res.status(400).json({
          success: false,
          message: "Video verification must be passed first",
        });
      }

      const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "site_visit_photos",
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          uploadStream.end(file.buffer);
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      application.siteVisitPhotos = {
        photo1: {
          url: uploadedUrls[0],
          uploadedAt: new Date(),
          geoLocation: {
            latitude: geoLocations[0].lat,
            longitude: geoLocations[0].lng,
          },
        },
        photo2: {
          url: uploadedUrls[1],
          uploadedAt: new Date(),
          geoLocation: {
            latitude: geoLocations[1].lat,
            longitude: geoLocations[1].lng,
          },
        },
      };

      await application.save();

      return res.json({
        success: true,
        message: "Site photos uploaded successfully",
        data: application.siteVisitPhotos,
      });
    } catch (error) {
      console.error("Upload site photos error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload photos",
      });
    }
  },

  getOwnerJourney: async (req, res) => {
    try {
      const { applicationId } = req.params;
      const ownerId = req.userId;

      const application = await AdoptionApplication.findOne({
        _id: applicationId,
        ownerId,
      })
        .populate("petId", "name species breed coverImage")
        .populate("shelterId", "email")
        .lean();

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      const ShelterProfile = (
        await import("../../models/profiles/ShelterProfile.js")
      ).default;
      const shelterProfile = await ShelterProfile.findOne({
        shelterId: application.shelterId._id,
      }).lean();

      const meetingDetails = await RoomMeetingPet.findOne({
        applicationId: application._id,
        ownerId: application.ownerId,
        petId: application.petId,
        shelterId: application.shelterId,
      }).lean();

      const journeySteps = generateJourneySteps(application, meetingDetails);

      return res.json({
        success: true,
        data: {
          application,
          shelterProfile,
          meetingDetails,
          journeySteps,
          isRejected: [
            "application-rejected",
            "video-verification-reject",
            "final-reject",
          ].includes(application.status),
        },
      });
    } catch (error) {
      console.error("Get owner journey error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch journey",
      });
    }
  },
  getOwnerApplications: async (req, res) => {
    try {
      const ownerId = req.userId;

      const applications = await AdoptionApplication.find({
        ownerId,
      })
        .populate("petId", "name species breed coverImage")
        .sort({ createdAt: -1 })
        .lean();

      return res.json({
        success: true,
        data: applications,
      });
    } catch (error) {
      console.error("Get owner applications error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch applications",
      });
    }
  },
};

function generateJourneySteps(application, meetingDetails) {
  const steps = [
    {
      id: 1,
      label: "Application Submitted",
      description: "Initial application review by shelter",
      status: "grey",
      canUpdate: false,
      requiresMeeting: false,
      requiresPhotos: false,
    },
    {
      id: 2,
      label: "Video Verification",
      description: "Virtual meeting with shelter for verification",
      status: "grey",
      canUpdate: false,
      requiresMeeting: true,
      requiresPhotos: false,
    },
    {
      id: 3,
      label: "On-Site Visit & Final Approval",
      description: "Physical site verification and final decision",
      status: "grey",
      canUpdate: false,
      requiresMeeting: false,
      requiresPhotos: true,
    },
  ];

  if (application.status === "submitted") {
    steps[0].status = "yellow";
  } else if (application.status === "application-rejected") {
    steps[0].status = "red";
  } else if (
    [
      "review",
      "video-verification-scheduled",
      "video-verification-passed",
      "approved",
    ].includes(application.status)
  ) {
    steps[0].status = "green";
  }

  if (
    application.status === "review" ||
    application.status === "video-verification-scheduled"
  ) {
    if (meetingDetails) {
      if (meetingDetails.status === "scheduled") {
        steps[1].status = "yellow";
      } else if (meetingDetails.status === "completed") {
        steps[1].status = "yellow";
        steps[1].canUpdate = true;
      }
    } else {
      steps[1].status = "grey";
    }
  } else if (application.status === "video-verification-reject") {
    steps[1].status = "red";
  } else if (
    application.status === "video-verification-passed" ||
    application.status === "approved"
  ) {
    steps[1].status = "green";
  }

  if (application.status === "video-verification-passed") {
    steps[2].status = "yellow";
    if (
      application.siteVisitPhotos?.photo1?.url &&
      application.siteVisitPhotos?.photo2?.url
    ) {
      steps[2].canUpdate = true;
    }
  } else if (application.status === "final-reject") {
    steps[2].status = "red";
  } else if (application.status === "approved") {
    steps[2].status = "green";
  }

  return steps;
}

export default applicationJourneyController;
