import AdoptionApplication from "../../models/adoption/AdoptionApplication.js";
import PetProfile from "../../models/profiles/PetProfile.js";
import ShelterProfile from "../../models/profiles/ShelterProfile.js";
import Notification from "../../models/notifications/Notification.js";
import CheckPetStatus from "../../models/petStatus/CheckPetStatus.js";

const adoptionController = {
  getAvailableSpecies: async (req, res) => {
    try {
      const species = await PetProfile.distinct("species", {
        adoptionStatus: "available",
        isActive: true,
      });

      return res.json({
        success: true,
        data: species,
      });
    } catch (error) {
      console.error("Get species error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch species",
      });
    }
  },

  getBreedsBySpecies: async (req, res) => {
    try {
      const { species } = req.params;

      const breeds = await PetProfile.distinct("breed", {
        species,
        adoptionStatus: "available",
        isActive: true,
      });

      return res.json({
        success: true,
        data: breeds,
      });
    } catch (error) {
      console.error("Get breeds error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch breeds",
      });
    }
  },

  getAvailablePets: async (req, res) => {
    try {
      const { species, breed } = req.query;
      const ownerId = req.userId;

      const query = {
        adoptionStatus: "available",
        isActive: true,
      };

      if (species) query.species = species;
      if (breed && breed !== "all") query.breed = breed;

      const pets = await PetProfile.find(query)
        .populate("shelterId", "email")
        .sort({ createdAt: -1 })
        .lean();

      const shelterIds = [...new Set(pets.map((p) => p.shelterId._id))];
      const shelters = await ShelterProfile.find({
        shelterId: { $in: shelterIds },
      }).lean();

      const shelterMap = new Map(
        shelters.map((s) => [s.shelterId.toString(), s])
      );

      const petIds = pets.map((p) => p._id);

      const petStatuses = await CheckPetStatus.find({
        petId: { $in: petIds },
      }).lean();

      const petStatusMap = new Map(
        petStatuses.map((status) => [status.petId.toString(), status])
      );
      const allApplications = await AdoptionApplication.find({
        petId: { $in: petIds },
      }).lean();

      const applicationMap = new Map();
      allApplications.forEach((app) => {
        const petIdStr = app.petId.toString();
        if (!applicationMap.has(petIdStr)) {
          applicationMap.set(petIdStr, []);
        }
        applicationMap.get(petIdStr).push(app);
      });

      const petsWithShelterAndStatus = pets.map((pet) => {
        const petIdStr = pet._id.toString();
        const petStatus = petStatusMap.get(petIdStr);
        const applications = applicationMap.get(petIdStr) || [];

        const ownerApp = applications.find(
          (app) => app.ownerId.toString() === ownerId.toString()
        );

        let buttonState = {
          text: "Apply",
          disabled: false,
          reason: null,
        };

        if (petStatus?.activeOwnerId) {
          const activeOwnerIdStr = petStatus.activeOwnerId.toString();

          if (activeOwnerIdStr === ownerId.toString()) {
            if (
              ownerApp?.status === "submitted" ||
              ownerApp?.status === "review"
            ) {
              buttonState = {
                text: "Withdraw",
                disabled: false,
                reason: "own_submitted",
              };
            } else if (ownerApp?.status === "approved") {
              buttonState = {
                text: "Adoption Approved",
                disabled: true,
                reason: "own_approved",
              };
            }
          } else {
            buttonState = {
              text: "Already Applied by Another User",
              disabled: true,
              reason: "active_by_other",
            };
          }
        } else {
          if (ownerApp) {
            if (ownerApp.status === "approved") {
              buttonState = {
                text: "Adoption Approved",
                disabled: true,
                reason: "own_approved",
              };
            } else if (ownerApp.status === "rejected") {
              buttonState = {
                text: "Apply Again",
                disabled: false,
                reason: "own_rejected",
              };
            }
          }
        }
        return {
          ...pet,
          shelter: shelterMap.get(pet.shelterId._id.toString()),
          applicationStatus: buttonState,
        };
      });

      return res.json({
        success: true,
        data: petsWithShelterAndStatus,
      });
    } catch (error) {
      console.error("Get pets error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch pets",
      });
    }
  },

  getPetDetails: async (req, res) => {
    try {
      const { petId } = req.params;
      const ownerId = req.userId;

      const pet = await PetProfile.findOne({
        _id: petId,
        isActive: true,
      })
        .populate("shelterId", "email")
        .lean();

      if (!pet) {
        return res.status(404).json({
          success: false,
          message: "Pet not found",
        });
      }

      const shelter = await ShelterProfile.findOne({
        shelterId: pet.shelterId._id,
      }).lean();

      const petStatus = await CheckPetStatus.findOne({ petId }).lean();

      const applications = await AdoptionApplication.find({
        petId,
      }).lean();

      const ownerApp = applications.find(
        (app) => app.ownerId.toString() === ownerId.toString()
      );

      const otherApprovedApp = applications.find(
        (app) =>
          app.ownerId.toString() !== ownerId.toString() &&
          app.status === "approved"
      );

      const otherPendingApp = applications.find(
        (app) =>
          app.ownerId.toString() !== ownerId.toString() &&
          app.status === "submitted"
      );

      let buttonState = {
        text: "Apply",
        disabled: false,
        reason: null,
      };

      if (otherApprovedApp) {
        buttonState = {
          text: "Already Taken",
          disabled: true,
          reason: "approved_by_other",
        };
      } else if (otherPendingApp) {
        buttonState = {
          text: "Applied by Another User",
          disabled: true,
          reason: "pending_by_other",
        };
      } else if (ownerApp) {
        if (ownerApp.status === "pending") {
          buttonState = {
            text: "Applied (Pending)",
            disabled: true,
            reason: "own_pending",
          };
        } else if (ownerApp.status === "approved") {
          buttonState = {
            text: "Adoption Approved",
            disabled: true,
            reason: "own_approved",
          };
        } else if (ownerApp.status === "rejected") {
          buttonState = {
            text: "Apply Again",
            disabled: false,
            reason: "own_rejected",
          };
        } else if (ownerApp.status === "withdrawn") {
          buttonState = {
            text: "Apply",
            disabled: false,
            reason: "own_withdrawn",
          };
        }
      }

      return res.json({
        success: true,
        data: {
          ...pet,
          shelter,
          applicationStatus: buttonState,
        },
      });
    } catch (error) {
      console.error("Get pet details error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch pet details",
      });
    }
  },

  submitApplication: async (req, res) => {
    try {
      const ownerId = req.userId;
      const { petId, applicationData, agreedToTerms } = req.body;

      if (!agreedToTerms) {
        return res.status(400).json({
          success: false,
          message: "You must agree to terms and conditions",
        });
      }

      const pet = await PetProfile.findOne({
        _id: petId,
        isActive: true,
      });

      if (!pet) {
        return res.status(404).json({
          success: false,
          message: "Pet not found",
        });
      }

      if (pet.adoptionStatus === "adopted") {
        return res.status(400).json({
          success: false,
          message: "This pet has already been adopted",
        });
      }

      if (pet.adoptionStatus !== "available") {
        return res.status(400).json({
          success: false,
          message: "Pet not available for adoption",
        });
      }

      const petStatus = await CheckPetStatus.findOne({ petId });

      if (petStatus?.activeOwnerId) {
        if (petStatus.activeOwnerId.toString() === ownerId.toString()) {
          return res.status(400).json({
            success: false,
            message: "You already have an active application for this pet",
          });
        }
        return res.status(400).json({
          success: false,
          message:
            "This pet already has an active application from another user",
        });
      }

      const existingApproved = await AdoptionApplication.findOne({
        ownerId,
        petId,
        status: "approved",
      });

      if (existingApproved) {
        return res.status(400).json({
          success: false,
          message: "You already have an approved application for this pet",
        });
      }

      const application = new AdoptionApplication({
        ownerId,
        shelterId: pet.shelterId,
        petId,
        applicationData,
        agreedToTerms,
      });

      await application.save();

      await CheckPetStatus.findOneAndUpdate(
        { petId },
        {
          activeOwnerId: ownerId,
          applicationId: application._id,
        },
        { upsert: true }
      );

      const ownerNotification = await Notification.create({
        userId: ownerId,
        userModel: "OwnerLogin",
        type: "general",
        title: "Application Submitted",
        message: `You applied to adopt ${pet.name}`,
        metadata: {
          applicationId: application._id,
          petId,
          shelterId: pet.shelterId,
        },
      });

      const shelterNotification = await Notification.create({
        userId: pet.shelterId,
        userModel: "ShelterLogin",
        type: "general",
        title: "New Adoption Application",
        message: `${applicationData.fullName} applied to adopt ${pet.name}`,
        metadata: {
          applicationId: application._id,
          petId,
          ownerId,
        },
      });

      if (req.app.locals.io) {
        req.app.locals.io.to(`user:${ownerId}`).emit("notification:new", {
          _id: ownerNotification._id,
          title: ownerNotification.title,
          message: ownerNotification.message,
          type: "general",
          read: false,
          createdAt: ownerNotification.createdAt,
          metadata: ownerNotification.metadata,
        });

        req.app.locals.io.to(`user:${pet.shelterId}`).emit("notification:new", {
          _id: shelterNotification._id,
          title: shelterNotification.title,
          message: shelterNotification.message,
          type: "general",
          read: false,
          createdAt: shelterNotification.createdAt,
          metadata: shelterNotification.metadata,
        });

        req.app.locals.io.to(`user:${pet.shelterId}`).emit("dashboard:update", {
          type: "new_application",
          data: {
            applicationId: application._id,
            petId,
            petName: pet.name,
            applicantName: applicationData.fullName,
          },
          timestamp: Date.now(),
        });
      }

      return res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        data: application,
      });
    } catch (error) {
      console.error("Submit application error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to submit application",
      });
    }
  },

  withdrawApplication: async (req, res) => {
    try {
      const ownerId = req.userId;
      const { applicationId } = req.params;

      const application = await AdoptionApplication.findOne({
        _id: applicationId,
        ownerId,
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      if (!["submitted", "review"].includes(application.status)) {
        return res.status(400).json({
          success: false,
          message: "Cannot withdraw this application",
        });
      }

      const pet = await PetProfile.findById(application.petId).lean();

      await AdoptionApplication.findByIdAndDelete(applicationId);

      await CheckPetStatus.findOneAndUpdate(
        { petId: application.petId },
        {
          activeOwnerId: null,
          applicationId: null,
        }
      );

      const ownerNotification = await Notification.create({
        userId: ownerId,
        userModel: "OwnerLogin",
        type: "general",
        title: "Application Withdrawn",
        message: `You withdrew your application for ${pet?.name}`,
        metadata: {
          applicationId,
          petId: application.petId,
          shelterId: application.shelterId,
        },
      });

      const shelterNotification = await Notification.create({
        userId: application.shelterId,
        userModel: "ShelterLogin",
        type: "general",
        title: "Application Cancelled",
        message: `${application.applicationData.fullName} withdrew their application for ${pet?.name}`,
        metadata: {
          applicationId,
          petId: application.petId,
          ownerId,
        },
      });

      if (req.app.locals.io) {
        req.app.locals.io.to(`user:${ownerId}`).emit("notification:new", {
          _id: ownerNotification._id,
          title: ownerNotification.title,
          message: ownerNotification.message,
          type: "general",
          read: false,
          createdAt: ownerNotification.createdAt,
          metadata: ownerNotification.metadata,
        });

        req.app.locals.io
          .to(`user:${application.shelterId}`)
          .emit("notification:new", {
            _id: shelterNotification._id,
            title: shelterNotification.title,
            message: shelterNotification.message,
            type: "general",
            read: false,
            createdAt: shelterNotification.createdAt,
            metadata: shelterNotification.metadata,
          });

        req.app.locals.io
          .to(`user:${application.shelterId}`)
          .emit("application:withdrawn", {
            applicationId,
            petId: application.petId,
            ownerId,
            status: "withdrawn",
            timestamp: Date.now(),
          });
      }

      return res.json({
        success: true,
        message: "Application withdrawn successfully",
      });
    } catch (error) {
      console.error("Withdraw application error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to withdraw application",
      });
    }
  },

  getMyApplications: async (req, res) => {
    try {
      const ownerId = req.userId;

      const activeApplications = await AdoptionApplication.find({ ownerId })
        .populate("petId", "name species breed images coverImage")
        .populate("shelterId", "email")
        .sort({ createdAt: -1 })
        .lean();

      const RejectedApplication = (
        await import("../../models/adoption/RejectedApplication.js")
      ).default;

      const rejectedApplications = await RejectedApplication.find({ ownerId })
        .populate("petId", "name species breed images coverImage")
        .populate("shelterId", "email")
        .sort({ createdAt: -1 })
        .lean();

      const allApplications = [...activeApplications, ...rejectedApplications];

      return res.json({
        success: true,
        data: allApplications,
      });
    } catch (error) {
      console.error("Get applications error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch applications",
      });
    }
  },

  getApplicationDetail: async (req, res) => {
    try {
      const { applicationId } = req.params;
      const ownerId = req.userId;

      let application = await AdoptionApplication.findOne({
        _id: applicationId,
        ownerId,
      })
        .populate("petId", "name species breed images coverImage")
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

      return res.json({
        success: true,
        data: {
          application,
          shelterProfile,
          isArchived: false,
        },
      });
    } catch (error) {
      console.error("Fetch application detail error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch application details",
      });
    }
  },

  getArchivedApplications: async (req, res) => {
    try {
      const ownerId = req.userId;

      const RejectedApplication = (
        await import("../../models/adoption/RejectedApplication.js")
      ).default;

      const archivedApplications = await RejectedApplication.find({ ownerId })
        .populate("petId", "name species breed images coverImage")
        .populate("shelterId", "email")
        .sort({ rejectedAt: -1 })
        .lean();

      return res.json({
        success: true,
        data: archivedApplications,
        total: archivedApplications.length,
      });
    } catch (error) {
      console.error("Get archived applications error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch archived applications",
      });
    }
  },
  deleteApplication: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { applicationId } = req.params;
      const ownerId = req.userId;

      const application = await AdoptionApplication.findOne({
        _id: applicationId,
        ownerId,
        status: "application-rejected",
      }).session(session);

      if (!application) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: "Application not found or cannot be deleted",
        });
      }

      const pet = await PetProfile.findById(application.petId)
        .session(session)
        .lean();

      const RejectedApplication = (
        await import("../../models/adoption/RejectedApplication.js")
      ).default;

      const rejectedApp = new RejectedApplication({
        ownerId: application.ownerId,
        shelterId: application.shelterId,
        petId: application.petId,
        applicationData: application.applicationData,
        status: "rejected",
        rejectionReason: application.rejectionReason || "No reason provided",
        shelterNotes: application.shelterNotes,
        scheduledMeeting: application.scheduledMeeting,
        paymentStatus: application.paymentStatus,
        agreedToTerms: application.agreedToTerms,
        submittedAt: application.submittedAt,
        reviewedAt: application.reviewedAt || new Date(),
        rejectedAt: new Date(),
      });

      await rejectedApp.save({ session });
      await AdoptionApplication.findByIdAndDelete(applicationId).session(
        session
      );

      await CheckPetStatus.findOneAndUpdate(
        {
          petId: application.petId,
          applicationId: application._id,
        },
        {
          activeOwnerId: null,
          applicationId: null,
        },
        { session }
      );

      await session.commitTransaction();

      if (req.app.locals.io) {
        req.app.locals.io.to(`user:${ownerId}`).emit("application:archived", {
          applicationId: rejectedApp._id,
          petId: application.petId,
          timestamp: Date.now(),
        });
      }

      return res.json({
        success: true,
        message: "Application archived successfully",
        data: rejectedApp,
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Delete application error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to archive application",
      });
    } finally {
      session.endSession();
    }
  },

  getRejectedApplicationDetails: async (req, res) => {
    try {
      const { applicationId } = req.params;
      const ownerId = req.userId;

      let application = await AdoptionApplication.findOne({
        _id: applicationId,
        ownerId,
        status: {
          $in: [
            "application-reject",
            "video-verification-reject",
            "final-reject",
          ],
        },
      })
        .populate("petId", "name species breed images coverImage")
        .populate("shelterId", "email")
        .lean();

      let isRejected = true;

      if (!application) {
        const RejectedApplication = (
          await import("../../models/adoption/RejectedApplication.js")
        ).default;

        application = await RejectedApplication.findOne({
          _id: applicationId,
          ownerId,
        })
          .populate("petId", "name species breed images coverImage")
          .populate("shelterId", "email")
          .lean();
      }

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      const shelterProfile = await ShelterProfile.findOne({
        shelterId: application.shelterId._id,
      }).lean();

      return res.json({
        success: true,
        data: {
          application,
          shelterProfile,
          isRejected,
        },
      });
    } catch (error) {
      console.error("Fetch application details error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch application details",
      });
    }
  },
};

export default adoptionController;
