import mongoose from "mongoose";
import AdoptionApplication from "../../models/adoption/AdoptionApplication.js";
import PetProfile from "../../models/profiles/PetProfile.js";
import OwnerProfile from "../../models/profiles/OwnerProfile.js";
import Notification from "../../models/notifications/Notification.js";
import CheckPetStatus from "../../models/petStatus/CheckPetStatus.js";
import RoomChatPet from "../../models/rooms/RoomChatPet.js";
import RoomMeetingPet from "../../models/rooms/RoomMeetingPet.js";

const applicationManagementController = {
  getShelterApplications: async (req, res) => {
    try {
      const shelterId = req.userId;
      const { status, petId } = req.query;

      const query = { shelterId };
      if (petId) query.petId = petId;

      let activeQuery = {
        ...query,
        status: { $ne: "rejected" },
      };

      if (status && status !== "rejected") {
        activeQuery.status = status;
      }

      const activeApplications = await AdoptionApplication.find(activeQuery)
        .populate(
          "petId",
          "name species breed images coverImage adoptionStatus"
        )
        .populate("ownerId", "email")
        .sort({ createdAt: -1 })
        .lean();

      const RejectedApplication = (
        await import("../../models/adoption/RejectedApplication.js")
      ).default;

      let rejectedApplications = [];
      if (!status || status === "rejected") {
        const rejectedQuery = { shelterId };
        if (petId) rejectedQuery.petId = petId;

        rejectedApplications = await RejectedApplication.find(rejectedQuery)
          .populate(
            "petId",
            "name species breed images coverImage adoptionStatus"
          )
          .populate("ownerId", "email")
          .sort({ createdAt: -1 })
          .lean();
      }

      const allApplications = [...activeApplications, ...rejectedApplications];

      const groupedByPet = allApplications.reduce((acc, app) => {
        const petIdStr = app.petId._id.toString();
        if (!acc[petIdStr]) {
          acc[petIdStr] = {
            pet: app.petId,
            applications: [],
          };
        }
        acc[petIdStr].applications.push(app);
        return acc;
      }, {});

      const result = Object.values(groupedByPet);

      return res.json({
        success: true,
        data: result,
        total: allApplications.length,
      });
    } catch (error) {
      console.error("Get applications error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch applications",
      });
    }
  },

  getApplicationDetails: async (req, res) => {
    try {
      const { applicationId } = req.params;
      const shelterId = req.userId;

      let application = await AdoptionApplication.findOne({
        _id: applicationId,
        shelterId,
      })
        .populate("petId")
        .populate("ownerId", "email")
        .lean();

      let isRejected = false;

      if (!application) {
        const RejectedApplication = (
          await import("../../models/adoption/RejectedApplication.js")
        ).default;

        application = await RejectedApplication.findOne({
          _id: applicationId,
          shelterId,
        })
          .populate("petId")
          .populate("ownerId", "email")
          .lean();

        isRejected = true;
      }

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      const ownerProfile = await OwnerProfile.findOne({
        ownerId: application.ownerId._id,
      }).lean();

      return res.json({
        success: true,
        data: {
          application,
          ownerProfile,
          isRejected,
        },
      });
    } catch (error) {
      console.error("Get application details error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch application details",
      });
    }
  },

  moveToReview: async (req, res) => {
    try {
      const { applicationId } = req.params;
      const shelterId = req.userId;

      const application = await AdoptionApplication.findOne({
        _id: applicationId,
        shelterId,
        status: "submitted",
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found or already processed",
        });
      }

      application.status = "review";
      application.reviewedAt = new Date();
      await application.save();

      const pet = await PetProfile.findById(application.petId).lean();

      let chatRoom = await RoomChatPet.findOne({
        petId: application.petId,
        ownerId: application.ownerId,
        shelterId: application.shelterId,
      });

      if (!chatRoom) {
        chatRoom = await RoomChatPet.create({
          ownerId: application.ownerId,
          shelterId: application.shelterId,
          petId: application.petId,
          applicationId: application._id,
          status: "open",
        });
      } else if (chatRoom.status === "closed") {
        chatRoom.status = "open";
        chatRoom.applicationId = application._id;
        await chatRoom.save();
      }

      let meetingRoom = await RoomMeetingPet.findOne({
        petId: application.petId,
        ownerId: application.ownerId,
        shelterId: application.shelterId,
      });

      if (!meetingRoom) {
        meetingRoom = await RoomMeetingPet.create({
          ownerId: application.ownerId,
          shelterId: application.shelterId,
          petId: application.petId,
          applicationId: application._id,
          status: "open",
        });
      } else if (meetingRoom.status === "closed") {
        meetingRoom.status = "open";
        meetingRoom.applicationId = application._id;
        await meetingRoom.save();
      }

      const ownerNotification = await Notification.create({
        userId: application.ownerId,
        userModel: "OwnerLogin",
        type: "general",
        title: "Application Under Review",
        message: `Your application for ${pet?.name} is now being reviewed. Chat and meeting rooms have been created.`,
        metadata: {
          applicationId: application._id,
          petId: application.petId,
          shelterId,
          chatRoomId: chatRoom._id,
          meetingRoomId: meetingRoom._id,
        },
      });

      if (req.app.locals.io) {
        req.app.locals.io
          .to(`user:${application.ownerId}`)
          .emit("notification:new", {
            _id: ownerNotification._id,
            title: ownerNotification.title,
            message: ownerNotification.message,
            type: "general",
            read: false,
            createdAt: ownerNotification.createdAt,
          });

        req.app.locals.io
          .to(`user:${application.ownerId}`)
          .emit("room:chat:status", {
            chatRoomId: chatRoom._id,
            status: "open",
            action: "auto_created",
            petId: application.petId,
            timestamp: Date.now(),
          });

        req.app.locals.io
          .to(`user:${application.ownerId}`)
          .emit("room:meeting:status", {
            meetingRoomId: meetingRoom._id,
            status: "open",
            action: "auto_created",
            petId: application.petId,
            timestamp: Date.now(),
          });
      }

      return res.json({
        success: true,
        message:
          "Application moved to review. Chat and meeting rooms created automatically.",
        data: {
          application,
          chatRoom,
          meetingRoom,
        },
      });
    } catch (error) {
      console.error("Move to review error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update application",
      });
    }
  },

  rejectApplicationStatus: async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { rejectionReason } = req.body;
      const shelterId = req.userId;

      if (!rejectionReason || rejectionReason.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required",
        });
      }

      const application = await AdoptionApplication.findOne({
        _id: applicationId,
        shelterId,
        status: { $in: ["submitted", "review"] },
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found or already processed",
        });
      }

      application.status = "application-rejected";
      application.rejectionReason = rejectionReason;
      application.reviewedAt = new Date();
      await application.save();
      await CheckPetStatus.findOneAndUpdate(
        {
          petId: application.petId,
          applicationId: application._id,
        },
        {
          activeOwnerId: null,
          applicationId: null,
        }
      );

      const pet = await PetProfile.findById(application.petId).lean();

      const ownerNotification = await Notification.create({
        userId: application.ownerId,
        userModel: "OwnerLogin",
        type: "general",
        title: "Application Status Update",
        message: `Your application for ${pet?.name} has been rejected`,
        metadata: {
          applicationId: application._id,
          petId: application.petId,
          shelterId,
          rejectionReason,
          status: "application-rejected",
        },
      });

      if (req.app.locals.io) {
        req.app.locals.io
          .to(`user:${application.ownerId}`)
          .emit("notification:new", {
            _id: ownerNotification._id,
            title: ownerNotification.title,
            message: ownerNotification.message,
            type: "general",
            read: false,
            createdAt: ownerNotification.createdAt,
            metadata: ownerNotification.metadata,
          });

        req.app.locals.io
          .to(`user:${application.ownerId}`)
          .emit("application:status:updated", {
            applicationId: application._id,
            petId: application.petId,
            status: "application-rejected",
            rejectionReason,
            timestamp: Date.now(),
          });
      }

      return res.json({
        success: true,
        message: "Application rejected successfully",
        data: application,
      });
    } catch (error) {
      console.error("Reject application status error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to reject application",
      });
    }
  },

  deleteApplication: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { applicationId } = req.params;
      const shelterId = req.userId;

      const application = await AdoptionApplication.findOne({
        _id: applicationId,
        shelterId,
        status: {
          $in: [
            "application-rejected",
            "video-verification-reject",
            "final-reject",
          ],
        },
      }).session(session);

      if (!application) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message:
            "Application not found or cannot be deleted. Only rejected applications can be archived.",
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

      const ownerNotification = await Notification.create(
        [
          {
            userId: application.ownerId,
            userModel: "OwnerLogin",
            type: "general",
            title: "Application Archived",
            message: `Your adoption application for ${pet?.name} has been archived`,
            metadata: {
              applicationId: rejectedApp._id,
              petId: application.petId,
              shelterId,
              rejectionReason: application.rejectionReason,
            },
          },
        ],
        { session }
      );

      const chatRoom = await RoomChatPet.findOne({
        petId: application.petId,
        ownerId: application.ownerId,
        shelterId: application.shelterId,
      }).session(session);

      if (chatRoom) {
        const RoomChatMessage = (
          await import("../../models/rooms/RoomChatMessage.js")
        ).default;

        await RoomChatMessage.create(
          [
            {
              roomId: chatRoom._id,
              senderId: shelterId,
              senderModel: "ShelterLogin",
              messageType: "system",
              content: "❌ Application was archived",
            },
          ],
          { session }
        );
      }

      await session.commitTransaction();

      if (req.app.locals.io) {
        req.app.locals.io
          .to(`user:${application.ownerId}`)
          .emit("notification:new", {
            _id: ownerNotification[0]._id,
            title: ownerNotification[0].title,
            message: ownerNotification[0].message,
            type: "general",
            read: false,
            createdAt: ownerNotification[0].createdAt,
            metadata: ownerNotification[0].metadata,
          });

        req.app.locals.io
          .to(`user:${application.ownerId}`)
          .emit("application:deleted", {
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

  createChatConnection: async (req, res) => {
    try {
      const { applicationId } = req.params;
      const shelterId = req.userId;

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

      const existingChat = await RoomChatPet.findOne({
        petId: application.petId,
        ownerId: application.ownerId,
        shelterId: application.shelterId,
      });

      const pet = await PetProfile.findById(application.petId).lean();
      let chatRoom;
      let actionType = "created";

      if (existingChat) {
        if (existingChat.status === "blocked") {
          return res.status(400).json({
            success: false,
            message: "Chat room is blocked and cannot be reopened",
          });
        }

        if (existingChat.status === "closed") {
          existingChat.status = "open";
          existingChat.applicationId = application._id;
          await existingChat.save();

          const RoomChatMessage = (
            await import("../../models/rooms/RoomChatMessage.js")
          ).default;

          await RoomChatMessage.create({
            roomId: existingChat._id,
            senderId: shelterId,
            senderModel: "ShelterLogin",
            messageType: "system",
            content: "📌 New application attempt started",
          });

          chatRoom = existingChat;
          actionType = "reopened";
        } else if (existingChat.status === "open") {
          if (
            existingChat.applicationId.toString() !== application._id.toString()
          ) {
            existingChat.applicationId = application._id;
            await existingChat.save();

            const RoomChatMessage = (
              await import("../../models/rooms/RoomChatMessage.js")
            ).default;

            await RoomChatMessage.create({
              roomId: existingChat._id,
              senderId: shelterId,
              senderModel: "ShelterLogin",
              messageType: "system",
              content: "📌 New application attempt started",
            });
          }
          chatRoom = existingChat;
          actionType = "already_exists";
        } else {
          chatRoom = existingChat;
          actionType = "already_exists";
        }
      } else {
        chatRoom = await RoomChatPet.create({
          ownerId: application.ownerId,
          shelterId: application.shelterId,
          petId: application.petId,
          applicationId: application._id,
          status: "open",
        });
        actionType = "created";
      }

      const ownerNotification = await Notification.create({
        userId: application.ownerId,
        userModel: "OwnerLogin",
        type: "general",
        title:
          actionType === "reopened"
            ? "Chat Room Reopened"
            : "Chat Connection Created",
        message:
          actionType === "reopened"
            ? `The chat room for ${pet?.name} has been reopened`
            : `The shelter has created a chat connection for ${pet?.name}`,
        metadata: {
          applicationId: application._id,
          petId: application.petId,
          shelterId,
          chatRoomId: chatRoom._id,
          roomStatus: chatRoom.status,
        },
      });

      if (req.app.locals.io) {
        req.app.locals.io
          .to(`user:${application.ownerId}`)
          .emit("notification:new", {
            _id: ownerNotification._id,
            title: ownerNotification.title,
            message: ownerNotification.message,
            type: "general",
            read: false,
            createdAt: ownerNotification.createdAt,
            metadata: ownerNotification.metadata,
          });

        req.app.locals.io
          .to(`user:${application.ownerId}`)
          .emit("room:chat:status", {
            chatRoomId: chatRoom._id,
            status: chatRoom.status,
            action: actionType,
            petId: application.petId,
            timestamp: Date.now(),
          });
      }

      return res.json({
        success: true,
        message:
          actionType === "reopened"
            ? "Chat room reopened successfully"
            : actionType === "already_exists"
            ? "Chat connection already exists"
            : "Chat connection created successfully",
        data: chatRoom,
        action: actionType,
      });
    } catch (error) {
      console.error("Create chat connection error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create chat connection",
      });
    }
  },

  createMeetingConnection: async (req, res) => {
    try {
      const { applicationId } = req.params;
      const shelterId = req.userId;

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

      const existingMeeting = await RoomMeetingPet.findOne({
        petId: application.petId,
        ownerId: application.ownerId,
        shelterId: application.shelterId,
      });

      const pet = await PetProfile.findById(application.petId).lean();
      let meetingRoom;
      let actionType = "created";

      if (existingMeeting) {
        if (existingMeeting.status === "blocked") {
          return res.status(400).json({
            success: false,
            message: "Meeting room is blocked and cannot be reopened",
          });
        }

        if (existingMeeting.status === "closed") {
          existingMeeting.status = "open";
          existingMeeting.applicationId = application._id;
          await existingMeeting.save();
          meetingRoom = existingMeeting;
          actionType = "reopened";
        } else if (existingMeeting.status === "open") {
          if (
            existingMeeting.applicationId.toString() !==
            application._id.toString()
          ) {
            existingMeeting.applicationId = application._id;
            await existingMeeting.save();
          }
          meetingRoom = existingMeeting;
          actionType = "already_exists";
        } else {
          meetingRoom = existingMeeting;
          actionType = "already_exists";
        }
      } else {
        meetingRoom = await RoomMeetingPet.create({
          ownerId: application.ownerId,
          shelterId: application.shelterId,
          petId: application.petId,
          applicationId: application._id,
          status: "open",
        });
        actionType = "created";
      }

      const ownerNotification = await Notification.create({
        userId: application.ownerId,
        userModel: "OwnerLogin",
        type: "general",
        title:
          actionType === "reopened"
            ? "Meeting Room Reopened"
            : "Meeting Connection Created",
        message:
          actionType === "reopened"
            ? `The meeting room for ${pet?.name} has been reopened`
            : `The shelter has created a meeting connection for ${pet?.name}`,
        metadata: {
          applicationId: application._id,
          petId: application.petId,
          shelterId,
          meetingRoomId: meetingRoom._id,
          roomStatus: meetingRoom.status,
        },
      });

      if (req.app.locals.io) {
        req.app.locals.io
          .to(`user:${application.ownerId}`)
          .emit("notification:new", {
            _id: ownerNotification._id,
            title: ownerNotification.title,
            message: ownerNotification.message,
            type: "general",
            read: false,
            createdAt: ownerNotification.createdAt,
            metadata: ownerNotification.metadata,
          });

        req.app.locals.io
          .to(`user:${application.ownerId}`)
          .emit("room:meeting:status", {
            meetingRoomId: meetingRoom._id,
            status: meetingRoom.status,
            action: actionType,
            petId: application.petId,
            timestamp: Date.now(),
          });
      }

      return res.json({
        success: true,
        message:
          actionType === "reopened"
            ? "Meeting room reopened successfully"
            : actionType === "already_exists"
            ? "Meeting connection already exists"
            : "Meeting connection created successfully",
        data: meetingRoom,
        action: actionType,
      });
    } catch (error) {
      console.error("Create meeting connection error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create meeting connection",
      });
    }
  },

  closeChatConnection: async (req, res) => {
    try {
      const { applicationId } = req.params;
      const shelterId = req.userId;

      const application = await AdoptionApplication.findOne({
        _id: applicationId,
        shelterId,
      }).lean();

      let isRejected = false;
      if (!application) {
        const RejectedApplication = (
          await import("../../models/adoption/RejectedApplication.js")
        ).default;
        const rejectedApp = await RejectedApplication.findOne({
          _id: applicationId,
          shelterId,
        }).lean();

        if (!rejectedApp) {
          return res.status(404).json({
            success: false,
            message: "Application not found",
          });
        }
        isRejected = true;
      }

      const appData =
        application ||
        (await (async () => {
          const RejectedApplication = (
            await import("../../models/adoption/RejectedApplication.js")
          ).default;
          return await RejectedApplication.findOne({
            _id: applicationId,
            shelterId,
          }).lean();
        })());

      const chatRoom = await RoomChatPet.findOne({
        petId: appData.petId,
        ownerId: appData.ownerId,
        shelterId: appData.shelterId,
      });

      if (!chatRoom) {
        return res.status(404).json({
          success: false,
          message: "Chat room not found",
        });
      }

      if (chatRoom.status === "closed") {
        return res.status(400).json({
          success: false,
          message: "Chat room is already closed",
        });
      }

      chatRoom.status = "closed";
      await chatRoom.save();

      const pet = await PetProfile.findById(appData.petId).lean();

      const ownerNotification = await Notification.create({
        userId: appData.ownerId,
        userModel: "OwnerLogin",
        type: "general",
        title: "Chat Room Closed",
        message: `The chat room for ${pet?.name} has been closed by the shelter`,
        metadata: {
          applicationId: appData._id,
          petId: appData.petId,
          shelterId,
          chatRoomId: chatRoom._id,
        },
      });

      if (req.app.locals.io) {
        req.app.locals.io
          .to(`user:${appData.ownerId}`)
          .emit("notification:new", {
            _id: ownerNotification._id,
            title: ownerNotification.title,
            message: ownerNotification.message,
            type: "general",
            read: false,
            createdAt: ownerNotification.createdAt,
            metadata: ownerNotification.metadata,
          });

        req.app.locals.io
          .to(`user:${appData.ownerId}`)
          .emit("room:chat:status", {
            chatRoomId: chatRoom._id,
            status: "closed",
            action: "closed",
            petId: appData.petId,
            timestamp: Date.now(),
          });
      }

      return res.json({
        success: true,
        message: "Chat room closed successfully",
        data: chatRoom,
      });
    } catch (error) {
      console.error("Close chat connection error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to close chat connection",
      });
    }
  },

  closeMeetingConnection: async (req, res) => {
    try {
      const { applicationId } = req.params;
      const shelterId = req.userId;

      const application = await AdoptionApplication.findOne({
        _id: applicationId,
        shelterId,
      }).lean();

      let isRejected = false;
      if (!application) {
        const RejectedApplication = (
          await import("../../models/adoption/RejectedApplication.js")
        ).default;
        const rejectedApp = await RejectedApplication.findOne({
          _id: applicationId,
          shelterId,
        }).lean();

        if (!rejectedApp) {
          return res.status(404).json({
            success: false,
            message: "Application not found",
          });
        }
        isRejected = true;
      }

      const appData =
        application ||
        (await (async () => {
          const RejectedApplication = (
            await import("../../models/adoption/RejectedApplication.js")
          ).default;
          return await RejectedApplication.findOne({
            _id: applicationId,
            shelterId,
          }).lean();
        })());

      const meetingRoom = await RoomMeetingPet.findOne({
        petId: appData.petId,
        ownerId: appData.ownerId,
        shelterId: appData.shelterId,
      });

      if (!meetingRoom) {
        return res.status(404).json({
          success: false,
          message: "Meeting room not found",
        });
      }

      if (meetingRoom.status === "closed") {
        return res.status(400).json({
          success: false,
          message: "Meeting room is already closed",
        });
      }

      meetingRoom.status = "closed";
      await meetingRoom.save();

      const pet = await PetProfile.findById(appData.petId).lean();

      const ownerNotification = await Notification.create({
        userId: appData.ownerId,
        userModel: "OwnerLogin",
        type: "general",
        title: "Meeting Room Closed",
        message: `The meeting room for ${pet?.name} has been closed by the shelter`,
        metadata: {
          applicationId: appData._id,
          petId: appData.petId,
          shelterId,
          meetingRoomId: meetingRoom._id,
        },
      });

      if (req.app.locals.io) {
        req.app.locals.io
          .to(`user:${appData.ownerId}`)
          .emit("notification:new", {
            _id: ownerNotification._id,
            title: ownerNotification.title,
            message: ownerNotification.message,
            type: "general",
            read: false,
            createdAt: ownerNotification.createdAt,
            metadata: ownerNotification.metadata,
          });

        req.app.locals.io
          .to(`user:${appData.ownerId}`)
          .emit("room:meeting:status", {
            meetingRoomId: meetingRoom._id,
            status: "closed",
            action: "closed",
            petId: appData.petId,
            timestamp: Date.now(),
          });
      }

      return res.json({
        success: true,
        message: "Meeting room closed successfully",
        data: meetingRoom,
      });
    } catch (error) {
      console.error("Close meeting connection error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to close meeting connection",
      });
    }
  },
  getChatRoomStatus: async (req, res) => {
    try {
      const { applicationId } = req.params;
      const shelterId = req.userId;

      const application = await AdoptionApplication.findOne({
        _id: applicationId,
        shelterId,
      }).lean();

      if (!application) {
        const RejectedApplication = (
          await import("../../models/adoption/RejectedApplication.js")
        ).default;
        const rejectedApp = await RejectedApplication.findOne({
          _id: applicationId,
          shelterId,
        }).lean();

        if (!rejectedApp) {
          return res.status(404).json({
            success: false,
            message: "Application not found",
          });
        }
      }

      const appData =
        application ||
        (await (async () => {
          const RejectedApplication = (
            await import("../../models/adoption/RejectedApplication.js")
          ).default;
          return await RejectedApplication.findOne({
            _id: applicationId,
            shelterId,
          }).lean();
        })());

      const chatRoom = await RoomChatPet.findOne({
        petId: appData.petId,
        ownerId: appData.ownerId,
        shelterId: appData.shelterId,
      }).lean();

      return res.json({
        success: true,
        data: chatRoom
          ? { status: chatRoom.status, roomId: chatRoom._id }
          : null,
      });
    } catch (error) {
      console.error("Get chat room status error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch chat room status",
      });
    }
  },

  getMeetingRoomStatus: async (req, res) => {
    try {
      const { applicationId } = req.params;
      const shelterId = req.userId;

      const application = await AdoptionApplication.findOne({
        _id: applicationId,
        shelterId,
      }).lean();

      if (!application) {
        const RejectedApplication = (
          await import("../../models/adoption/RejectedApplication.js")
        ).default;
        const rejectedApp = await RejectedApplication.findOne({
          _id: applicationId,
          shelterId,
        }).lean();

        if (!rejectedApp) {
          return res.status(404).json({
            success: false,
            message: "Application not found",
          });
        }
      }

      const appData =
        application ||
        (await (async () => {
          const RejectedApplication = (
            await import("../../models/adoption/RejectedApplication.js")
          ).default;
          return await RejectedApplication.findOne({
            _id: applicationId,
            shelterId,
          }).lean();
        })());

      const meetingRoom = await RoomMeetingPet.findOne({
        petId: appData.petId,
        ownerId: appData.ownerId,
        shelterId: appData.shelterId,
      }).lean();

      return res.json({
        success: true,
        data: meetingRoom
          ? { status: meetingRoom.status, roomId: meetingRoom._id }
          : null,
      });
    } catch (error) {
      console.error("Get meeting room status error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch meeting room status",
      });
    }
  },

  getArchivedApplications: async (req, res) => {
    try {
      const shelterId = req.userId;

      const RejectedApplication = (
        await import("../../models/adoption/RejectedApplication.js")
      ).default;

      const archivedApplications = await RejectedApplication.find({ shelterId })
        .populate("petId", "name species breed images coverImage")
        .populate("ownerId", "email")
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
};

export default applicationManagementController;
