import mongoose from "mongoose";
import RoomMeetingPet from "../../models/rooms/RoomMeetingPet.js";
import OwnerProfile from "../../models/profiles/OwnerProfile.js";
import Notification from "../../models/notifications/Notification.js";
import AdoptionApplication from "../../models/adoption/AdoptionApplication.js";

const meetingController = {
  getEligibleOwners: async (req, res) => {
    try {
      const shelterId = req.userId;

      const meetingRooms = await RoomMeetingPet.find({ shelterId })
        .populate("ownerId", "_id")
        .lean();

      const ownerIds = [
        ...new Set(meetingRooms.map((room) => room.ownerId._id.toString())),
      ];

      const owners = await OwnerProfile.find({
        ownerId: { $in: ownerIds },
      })
        .select("ownerId name email")
        .lean();

      return res.json({
        success: true,
        owners,
      });
    } catch (error) {
      console.error("Get eligible owners error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch eligible owners",
      });
    }
  },

  getMeetings: async (req, res) => {
    try {
      const shelterId = req.userId;

      const meetings = await RoomMeetingPet.find({ shelterId })
        .populate("ownerId", "email")
        .populate("petId", "name species breed")
        .sort({ scheduledAt: -1 })
        .lean();

      const meetingsWithOwnerNames = await Promise.all(
        meetings.map(async (meeting) => {
          const ownerProfile = await OwnerProfile.findOne({
            ownerId: meeting.ownerId._id,
          })
            .select("name")
            .lean();

          return {
            ...meeting,
            ownerName: ownerProfile?.name || meeting.ownerId.email,
          };
        })
      );

      return res.json({
        success: true,
        meetings: meetingsWithOwnerNames,
      });
    } catch (error) {
      console.error("Get meetings error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch meetings",
      });
    }
  },

  createMeeting: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const shelterId = req.userId;
      const {
        ownerId,
        applicationId,
        scheduledAt,
        durationMinutes,
        meetingLink,
        notes,
        meetingPlatform,
      } = req.body;

      const scheduledDate = new Date(scheduledAt);
      if (scheduledDate <= new Date()) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Meeting time must be in the future",
        });
      }

      if (!applicationId) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Application ID is required",
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

      const existingMeeting = await RoomMeetingPet.findOne({
        applicationId: application._id,
      }).session(session);

      if (existingMeeting) {
        if (existingMeeting.status === "open") {
          existingMeeting.status = "scheduled";
          existingMeeting.scheduledAt = scheduledDate;
          existingMeeting.durationMinutes = durationMinutes || 30;
          existingMeeting.meetingLink = meetingLink;
          existingMeeting.meetingPlatform = meetingPlatform || "google-meet";
          existingMeeting.notes = notes || "";

          await existingMeeting.save({ session });

          const rejectedStatuses = [
            "application-rejected",
            "video-verification-reject",
            "final-reject",
            "rejected",
          ];

          if (!rejectedStatuses.includes(application.status)) {
            application.status = "video-verification-scheduled";
            await application.save({ session });
          }

          await session.commitTransaction();

          return res.json({
            success: true,
            meeting: existingMeeting,
            reused: true,
          });
        }

        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Meeting already exists for this application",
        });
      }

      const meeting = new RoomMeetingPet({
        ownerId: application.ownerId,
        shelterId: application.shelterId,
        petId: application.petId,
        applicationId: application._id,
        status: "scheduled",
        scheduledAt: scheduledDate,
        durationMinutes: durationMinutes || 30,
        meetingLink,
        meetingPlatform: meetingPlatform || "google-meet",
        notes: notes || "",
      });

      await meeting.save({ session });

      const rejectedStatuses = [
        "application-rejected",
        "video-verification-reject",
        "final-reject",
        "rejected",
      ];

      if (!rejectedStatuses.includes(application.status)) {
        application.status = "video-verification-scheduled";
        await application.save({ session });
      }

      const ownerProfile = await OwnerProfile.findOne({
        ownerId: application.ownerId,
      }).session(session);

      await Notification.create(
        [
          {
            userId: application.ownerId,
            userModel: "OwnerLogin",
            type: "general",
            title: "Meeting Scheduled",
            message: `A meeting has been scheduled with the shelter on ${scheduledDate.toLocaleDateString()} at ${scheduledDate.toLocaleTimeString()}`,
            metadata: {
              meetingId: meeting._id,
              shelterId,
              scheduledAt: scheduledDate,
              applicationId: application._id,
            },
          },
        ],
        { session }
      );

      await session.commitTransaction();

      if (req.app.locals.io) {
        req.app.locals.io
          .to(`user:${application.ownerId}`)
          .emit("notification:new", {
            title: "Meeting Scheduled",
            message: `A meeting has been scheduled with the shelter`,
            type: "general",
            read: false,
            createdAt: new Date(),
          });
      }

      const populatedMeeting = await RoomMeetingPet.findById(meeting._id)
        .populate("ownerId", "email")
        .populate("petId", "name species breed")
        .lean();

      return res.json({
        success: true,
        meeting: {
          ...populatedMeeting,
          ownerName: ownerProfile?.name || populatedMeeting.ownerId.email,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Create meeting error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create meeting",
      });
    } finally {
      session.endSession();
    }
  },

  updateMeeting: async (req, res) => {
    try {
      const { meetingId } = req.params;
      const shelterId = req.userId;
      const {
        scheduledAt,
        durationMinutes,
        meetingLink,
        notes,
        meetingPlatform,
      } = req.body;

      const meeting = await RoomMeetingPet.findOne({
        _id: meetingId,
        shelterId,
        status: { $in: ["scheduled", "open"] },
      });

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: "Meeting not found or cannot be edited",
        });
      }

      if (scheduledAt) {
        const scheduledDate = new Date(scheduledAt);
        if (scheduledDate <= new Date()) {
          return res.status(400).json({
            success: false,
            message: "Meeting time must be in the future",
          });
        }
        meeting.scheduledAt = scheduledDate;
      }

      if (durationMinutes) meeting.durationMinutes = durationMinutes;
      if (meetingLink) meeting.meetingLink = meetingLink;
      if (notes !== undefined) meeting.notes = notes;
      if (meetingPlatform) meeting.meetingPlatform = meetingPlatform;

      await meeting.save();

      await Notification.create({
        userId: meeting.ownerId,
        userModel: "OwnerLogin",
        type: "general",
        title: "Meeting Updated",
        message: "Your scheduled meeting details have been updated",
        metadata: {
          meetingId: meeting._id,
          shelterId,
        },
      });

      if (req.app.locals.io) {
        req.app.locals.io
          .to(`user:${meeting.ownerId}`)
          .emit("notification:new", {
            title: "Meeting Updated",
            message: "Your scheduled meeting details have been updated",
            type: "general",
            read: false,
            createdAt: new Date(),
          });
      }

      const populatedMeeting = await RoomMeetingPet.findById(meeting._id)
        .populate("ownerId", "email")
        .populate("petId", "name species breed")
        .lean();

      const ownerProfile = await OwnerProfile.findOne({
        ownerId: meeting.ownerId,
      });

      return res.json({
        success: true,
        meeting: {
          ...populatedMeeting,
          ownerName: ownerProfile?.name || populatedMeeting.ownerId.email,
        },
      });
    } catch (error) {
      console.error("Update meeting error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update meeting",
      });
    }
  },

  cancelMeeting: async (req, res) => {
    try {
      const { meetingId } = req.params;
      const shelterId = req.userId;
      const { cancellationReason } = req.body;

      if (!cancellationReason || cancellationReason.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Cancellation reason is required",
        });
      }

      const meeting = await RoomMeetingPet.findOne({
        _id: meetingId,
        shelterId,
        status: { $in: ["scheduled", "open"] },
      });

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: "Meeting not found or already processed",
        });
      }

      meeting.status = "cancelled";
      meeting.cancelledBy = "shelter";
      meeting.cancellationReason = cancellationReason;
      await meeting.save();

      await Notification.create({
        userId: meeting.ownerId,
        userModel: "OwnerLogin",
        type: "general",
        title: "Meeting Cancelled",
        message: `Your meeting has been cancelled. Reason: ${cancellationReason}`,
        metadata: {
          meetingId: meeting._id,
          shelterId,
          cancellationReason,
        },
      });

      if (req.app.locals.io) {
        req.app.locals.io
          .to(`user:${meeting.ownerId}`)
          .emit("notification:new", {
            title: "Meeting Cancelled",
            message: "Your scheduled meeting has been cancelled",
            type: "general",
            read: false,
            createdAt: new Date(),
          });
      }

      return res.json({
        success: true,
        message: "Meeting cancelled successfully",
      });
    } catch (error) {
      console.error("Cancel meeting error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to cancel meeting",
      });
    }
  },

  markComplete: async (req, res) => {
    try {
      const { meetingId } = req.params;
      const shelterId = req.userId;
      const meeting = await RoomMeetingPet.findOne({
        _id: meetingId,
        shelterId,
        status: { $in: ["open", "scheduled"] },
      });

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: "Meeting not found or not in scheduled status",
        });
      }

      const meetingTime = new Date(meeting.scheduledAt);
      const tenMinutesBefore = new Date(meetingTime.getTime() - 10 * 60 * 1000);

      if (new Date() < tenMinutesBefore) {
        return res.status(400).json({
          success: false,
          message: "Cannot mark meeting as complete before meeting time",
        });
      }

      meeting.status = "completed";
      await meeting.save();

      await Notification.create({
        userId: meeting.ownerId,
        userModel: "OwnerLogin",
        type: "general",
        title: "Meeting Completed",
        message: "Your meeting has been marked as completed",
        metadata: {
          meetingId: meeting._id,
          shelterId,
        },
      });

      if (req.app.locals.io) {
        req.app.locals.io
          .to(`user:${meeting.ownerId}`)
          .emit("notification:new", {
            title: "Meeting Completed",
            message: "Your meeting has been marked as completed",
            type: "general",
            read: false,
            createdAt: new Date(),
          });
      }

      return res.json({
        success: true,
        message: "Meeting marked as completed",
      });
    } catch (error) {
      console.error("Mark complete error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to mark meeting as complete",
      });
    }
  },

  deleteMeeting: async (req, res) => {
    try {
      const { meetingId } = req.params;
      const shelterId = req.userId;

      const meeting = await RoomMeetingPet.findOneAndDelete({
        _id: meetingId,
        shelterId,
      });

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: "Meeting not found",
        });
      }

      return res.json({
        success: true,
        message: "Meeting deleted successfully",
      });
    } catch (error) {
      console.error("Delete meeting error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete meeting",
      });
    }
  },

  getMeetingsByOwner: async (req, res) => {
    try {
      const ownerId = req.userId;
      const meetings = await RoomMeetingPet.find({
        ownerId: ownerId,
      })
        .populate("shelterId", "email")
        .populate("petId", "name species breed coverImage")
        .populate("applicationId")
        .sort({ scheduledAt: -1 })
        .lean();

      const ShelterProfile = (
        await import("../../models/profiles/ShelterProfile.js")
      ).default;

      const meetingsWithProfiles = await Promise.all(
        meetings.map(async (meeting) => {
          const shelterProfile = await ShelterProfile.findOne({
            shelterId: meeting.shelterId._id,
          })
            .select("name avatar")
            .lean();

          return {
            ...meeting,
            shelterProfile,
          };
        })
      );

      return res.json({
        success: true,
        data: meetingsWithProfiles,
        total: meetingsWithProfiles.length,
      });
    } catch (error) {
      console.error("Get owner meetings error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch meetings",
      });
    }
  },
};

export default meetingController;
