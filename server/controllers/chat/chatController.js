import RoomChatPet from "../../models/rooms/RoomChatPet.js";
import RoomChatMessage from "../../models/rooms/RoomChatMessage.js";
import PetProfile from "../../models/profiles/PetProfile.js";
import OwnerProfile from "../../models/profiles/OwnerProfile.js";
import ShelterProfile from "../../models/profiles/ShelterProfile.js";
import AdoptionApplication from "../../models/adoption/AdoptionApplication.js";
import cloudinary from "../../services/cloudinary.service.js";
import mongoose from "mongoose";

const chatController = {
  getChatRooms: async (req, res) => {
    try {
      const userId = req.userId;
      const userRole = req.userRole;

      const query =
        userRole === "owner" ? { ownerId: userId } : { shelterId: userId };

      const rooms = await RoomChatPet.find(query)
        .populate("petId", "name coverImage")
        .populate("ownerId", "email")
        .populate("shelterId", "email")
        .sort({ "lastMessage.timestamp": -1 })
        .lean();

      const enrichedRooms = await Promise.all(
        rooms.map(async (room) => {
          const ownerProfile = await OwnerProfile.findOne({
            ownerId: room.ownerId._id,
          })
            .select("name avatar")
            .lean();

          const shelterProfile = await ShelterProfile.findOne({
            shelterId: room.shelterId._id,
          })
            .select("name avatar")
            .lean();

          // Handle missing unreadCount
          const unreadCount = room.unreadCount || { owner: 0, shelter: 0 };

          return {
            ...room,
            ownerProfile,
            shelterProfile,
            unreadCount:
              userRole === "owner" ? unreadCount.owner : unreadCount.shelter,
          };
        })
      );

      return res.json({
        success: true,
        data: enrichedRooms,
      });
    } catch (error) {
      console.error("Get chat rooms error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch chat rooms",
      });
    }
  },

  getRoomMessages: async (req, res) => {
    try {
      const { roomId } = req.params;
      const userId = req.userId;
      const { page = 1, limit = 50 } = req.query;

      const room = await RoomChatPet.findById(roomId).lean();

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Chat room not found",
        });
      }

      if (
        room.ownerId.toString() !== userId.toString() &&
        room.shelterId.toString() !== userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const skip = (page - 1) * limit;

      const messages = await RoomChatMessage.find({
        roomId,
        deletedForEveryone: false,
        deletedFor: { $ne: userId },
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("replyTo", "content senderId messageType")
        .lean();

      const total = await RoomChatMessage.countDocuments({
        roomId,
        deletedForEveryone: false,
        deletedFor: { $ne: userId },
      });

      const userRole = req.userRole;
      if (userRole === "owner") {
        await RoomChatPet.findByIdAndUpdate(roomId, {
          "unreadCount.owner": 0,
        });
      } else {
        await RoomChatPet.findByIdAndUpdate(roomId, {
          "unreadCount.shelter": 0,
        });
      }

      const unreadMessages = await RoomChatMessage.find({
        roomId,
        "readBy.userId": { $ne: userId },
        senderId: { $ne: userId },
      }).lean();

      if (unreadMessages.length > 0) {
        await RoomChatMessage.updateMany(
          {
            roomId,
            "readBy.userId": { $ne: userId },
            senderId: { $ne: userId },
          },
          {
            $push: {
              readBy: {
                userId,
                readAt: new Date(),
              },
            },
          }
        );

        if (req.app.locals.io) {
          for (const msg of unreadMessages) {
            req.app.locals.io
              .to(`user:${msg.senderId.toString()}`)
              .emit("chat:message:read", {
                messageId: msg._id.toString(),
                roomId: roomId,
                readBy: userId,
                readAt: new Date(),
              });
          }
        }
      }

      return res.json({
        success: true,
        data: {
          messages: messages.reverse(),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            hasMore: skip + messages.length < total,
          },
          room,
        },
      });
    } catch (error) {
      console.error("Get room messages error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch messages",
      });
    }
  },

  sendMessage: async (req, res) => {
    try {
      const { roomId } = req.params;
      const { content, messageType = "text", replyTo = null } = req.body;
      const userId = req.userId;
      const userRole = req.userRole;

      const room = await RoomChatPet.findById(roomId);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Chat room not found",
        });
      }

      if (
        room.ownerId.toString() !== userId.toString() &&
        room.shelterId.toString() !== userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      if (room.status === "blocked" || room.status === "closed") {
        return res.status(400).json({
          success: false,
          message: "Cannot send messages in this chat",
        });
      }

      const senderModel = userRole === "owner" ? "OwnerLogin" : "ShelterLogin";

      let imageUrls = [];

      // Handle image upload
      if (req.file && messageType === "image") {
        try {
          const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  folder: "chat-images",
                  resource_type: "image",
                  transformation: [
                    { width: 800, height: 800, crop: "limit" },
                    { quality: "auto:good" },
                  ],
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              )
              .end(req.file.buffer);
          });

          imageUrls.push(uploadResult.secure_url);
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          return res.status(500).json({
            success: false,
            message: "Failed to upload image",
          });
        }
      }

      const message = await RoomChatMessage.create({
        roomId,
        senderId: userId,
        senderModel,
        messageType,
        content: content || "",
        images: imageUrls,
        replyTo: replyTo || null,
      });

      room.lastMessage = {
        content: messageType === "image" ? "📷 Image" : content || "",
        senderId: userId,
        timestamp: new Date(),
      };

      if (userRole === "owner") {
        room.unreadCount.shelter += 1;
      } else {
        room.unreadCount.owner += 1;
      }

      room.status = "ongoing";
      await room.save();

      const populatedMessage = await RoomChatMessage.findById(message._id)
        .populate("replyTo", "content senderId messageType")
        .lean();

      if (req.app.locals.io) {
        const recipientId =
          userRole === "owner"
            ? room.shelterId.toString()
            : room.ownerId.toString();

        req.app.locals.io.to(`user:${recipientId}`).emit("chat:message:new", {
          roomId,
          message: populatedMessage,
        });

        req.app.locals.io.to(`user:${recipientId}`).emit("chat:room:update", {
          roomId,
          lastMessage: room.lastMessage,
          unreadCount:
            userRole === "owner"
              ? room.unreadCount.shelter
              : room.unreadCount.owner,
        });

        const Notification = (
          await import("../../models/notifications/Notification.js")
        ).default;
        const OwnerProfile = (
          await import("../../models/profiles/OwnerProfile.js")
        ).default;
        const ShelterProfile = (
          await import("../../models/profiles/ShelterProfile.js")
        ).default;

        const recipientSockets = await req.app.locals.io
          .in(`user:${recipientId}`)
          .fetchSockets();
        const isRecipientInRoom = recipientSockets.some((s) =>
          s.rooms.has(`room:${roomId}`)
        );

        if (!isRecipientInRoom) {
          let senderName = "Someone";
          if (userRole === "owner") {
            const ownerProfile = await OwnerProfile.findOne({ ownerId: userId })
              .select("name")
              .lean();
            senderName = ownerProfile?.name || "An owner";
          } else {
            const shelterProfile = await ShelterProfile.findOne({
              shelterId: userId,
            })
              .select("name")
              .lean();
            senderName = shelterProfile?.name || "A shelter";
          }
          const notification = await Notification.create({
            userId: recipientId,
            userModel: userRole === "owner" ? "ShelterLogin" : "OwnerLogin",
            type: "general",
            title: "New Message",
            message: `You have a new message from ${senderName}`,
            metadata: {
              roomId: roomId,
              petName: room.petId?.name || "Unknown Pet",
            },
          });

          req.app.locals.io.to(`user:${recipientId}`).emit("notification:new", {
            ...notification.toObject(),
            timestamp: Date.now(),
          });
        }
      }

      return res.status(201).json({
        success: true,
        data: populatedMessage,
      });
    } catch (error) {
      console.error("Send message error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send message",
      });
    }
  },

  markAsDelivered: async (req, res) => {
    try {
      const { messageId } = req.params;
      const userId = req.userId;

      const message = await RoomChatMessage.findById(messageId);

      if (!message) {
        return res.status(404).json({
          success: false,
          message: "Message not found",
        });
      }

      // Don't mark own messages as delivered
      if (message.senderId.toString() === userId.toString()) {
        return res.json({ success: true });
      }

      const alreadyDelivered = message.deliveredTo.some(
        (d) => d.userId.toString() === userId.toString()
      );

      if (!alreadyDelivered) {
        message.deliveredTo.push({
          userId,
          deliveredAt: new Date(),
        });
        await message.save();

        if (req.app.locals.io) {
          req.app.locals.io
            .to(`user:${message.senderId.toString()}`)
            .emit("chat:message:delivered", {
              messageId: messageId.toString(),
              roomId: message.roomId.toString(),
              userId,
              deliveredAt: new Date(),
            });
        }
      }

      return res.json({
        success: true,
      });
    } catch (error) {
      console.error("Mark as delivered error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to mark as delivered",
      });
    }
  },
  markAsRead: async (req, res) => {
    try {
      const { messageId } = req.params;
      const userId = req.userId;

      const message = await RoomChatMessage.findById(messageId);

      if (!message) {
        return res.status(404).json({
          success: false,
          message: "Message not found",
        });
      }

      // Don't mark own messages as read
      if (message.senderId.toString() === userId.toString()) {
        return res.json({ success: true });
      }

      const alreadyRead = message.readBy.some(
        (r) => r.userId.toString() === userId.toString()
      );

      if (!alreadyRead) {
        message.readBy.push({
          userId,
          readAt: new Date(),
        });
        await message.save();

        if (req.app.locals.io) {
          req.app.locals.io
            .to(`user:${message.senderId.toString()}`)
            .emit("chat:message:read", {
              messageId: messageId.toString(),
              roomId: message.roomId.toString(),
              readBy: userId,
              readAt: new Date(),
            });
        }
      }

      return res.json({
        success: true,
      });
    } catch (error) {
      console.error("Mark as read error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to mark as read",
      });
    }
  },
  updateWallpaper: async (req, res) => {
    try {
      const { roomId } = req.params;
      const { wallpaper } = req.body;
      const userId = req.userId;

      const room = await RoomChatPet.findById(roomId);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Chat room not found",
        });
      }

      if (
        room.ownerId.toString() !== userId.toString() &&
        room.shelterId.toString() !== userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      room.wallpaper = wallpaper || "default";
      await room.save();

      if (req.app.locals.io) {
        req.app.locals.io.to(`room:${roomId}`).emit("chat:wallpaper:changed", {
          roomId,
          wallpaper: room.wallpaper,
        });
      }

      return res.json({
        success: true,
        data: room,
      });
    } catch (error) {
      console.error("Update wallpaper error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update wallpaper",
      });
    }
  },
  uploadWallpaper: async (req, res) => {
    try {
      const { roomId } = req.params;
      const userId = req.userId;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No wallpaper image provided",
        });
      }

      const room = await RoomChatPet.findById(roomId);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Chat room not found",
        });
      }

      if (
        room.ownerId.toString() !== userId.toString() &&
        room.shelterId.toString() !== userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload_stream(
        {
          folder: "chat-wallpapers",
          resource_type: "image",
          transformation: [
            { width: 1920, height: 1080, crop: "limit" },
            { quality: "auto:good" },
          ],
        },
        async (error, uploadResult) => {
          if (error) {
            return res.status(500).json({
              success: false,
              message: "Failed to upload wallpaper",
            });
          }

          room.wallpaper = uploadResult.secure_url;
          await room.save();

          if (req.app.locals.io) {
            req.app.locals.io
              .to(`room:${roomId}`)
              .emit("chat:wallpaper:changed", {
                roomId,
                wallpaper: uploadResult.secure_url,
              });
          }

          return res.json({
            success: true,
            wallpaperUrl: uploadResult.secure_url,
          });
        }
      );

      result.end(req.file.buffer);
    } catch (error) {
      console.error("Upload wallpaper error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload wallpaper",
      });
    }
  },

  deleteMessage: async (req, res) => {
    try {
      const { messageId } = req.params;
      const { deleteForEveryone = false } = req.body;
      const userId = req.userId;

      const message = await RoomChatMessage.findById(messageId);

      if (!message) {
        return res.status(404).json({
          success: false,
          message: "Message not found",
        });
      }

      if (deleteForEveryone) {
        if (message.senderId.toString() !== userId.toString()) {
          return res.status(403).json({
            success: false,
            message: "Can only delete your own messages for everyone",
          });
        }

        message.deletedForEveryone = true;
        message.content = "This message was deleted";
        await message.save();

        if (req.app.locals.io) {
          req.app.locals.io
            .to(`room:${message.roomId}`)
            .emit("chat:message:deleted", {
              messageId,
              deletedForEveryone: true,
            });
        }
      } else {
        if (!message.deletedFor.includes(userId)) {
          message.deletedFor.push(userId);
          await message.save();
        }
      }

      return res.json({
        success: true,
        message: "Message deleted",
      });
    } catch (error) {
      console.error("Delete message error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete message",
      });
    }
  },

  toggleReaction: async (req, res) => {
    try {
      const { messageId } = req.params;
      const { emoji } = req.body;
      const userId = req.userId;

      const message = await RoomChatMessage.findById(messageId);

      if (!message) {
        return res.status(404).json({
          success: false,
          message: "Message not found",
        });
      }

      const existingReaction = message.reactions.find(
        (r) => r.userId.toString() === userId.toString()
      );

      if (existingReaction) {
        if (existingReaction.emoji === emoji) {
          message.reactions = message.reactions.filter(
            (r) => r.userId.toString() !== userId.toString()
          );
        } else {
          existingReaction.emoji = emoji;
        }
      } else {
        message.reactions.push({ userId, emoji });
      }

      await message.save();

      if (req.app.locals.io) {
        req.app.locals.io
          .to(`room:${message.roomId}`)
          .emit("chat:message:reaction", {
            messageId,
            reactions: message.reactions,
          });
      }

      return res.json({
        success: true,
        data: message.reactions,
      });
    } catch (error) {
      console.error("Toggle reaction error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update reaction",
      });
    }
  },

  blockRoom: async (req, res) => {
    try {
      const { roomId } = req.params;
      const userId = req.userId;
      const userRole = req.userRole;

      if (userRole !== "shelter") {
        return res.status(403).json({
          success: false,
          message: "Only shelters can block chat rooms",
        });
      }

      const room = await RoomChatPet.findById(roomId);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Chat room not found",
        });
      }

      if (room.shelterId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      room.status = "blocked";
      await room.save();

      if (req.app.locals.io) {
        req.app.locals.io.to(`user:${room.ownerId}`).emit("chat:room:blocked", {
          roomId,
        });
      }

      return res.json({
        success: true,
        message: "Chat room blocked",
      });
    } catch (error) {
      console.error("Block room error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to block chat room",
      });
    }
  },

  closeRoom: async (req, res) => {
    try {
      const { roomId } = req.params;
      const userId = req.userId;
      const userRole = req.userRole;

      if (userRole !== "shelter") {
        return res.status(403).json({
          success: false,
          message: "Only shelters can close chat rooms",
        });
      }

      const room = await RoomChatPet.findById(roomId);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Chat room not found",
        });
      }

      if (room.shelterId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      room.status = "closed";
      await room.save();

      if (req.app.locals.io) {
        req.app.locals.io.to(`user:${room.ownerId}`).emit("chat:room:closed", {
          roomId,
        });
      }

      return res.json({
        success: true,
        message: "Chat room closed",
      });
    } catch (error) {
      console.error("Close room error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to close chat room",
      });
    }
  },
};

export default chatController;
