import RoomChatPet from "../../models/rooms/RoomChatPet.js";
import { safeEmit } from "../utils/socketHelpers.js";

export const setupChatHandlers = (io, socket) => {
  socket.on("chat:join", async ({ roomId }) => {
    try {
      const room = await RoomChatPet.findById(roomId).lean();
      const RoomChatMessage = (
        await import("../../models/rooms/RoomChatMessage.js")
      ).default;

      if (!room) {
        return safeEmit(socket, "chat:error", {
          message: "Room not found",
        });
      }

      if (
        room.ownerId.toString() !== socket.userId.toString() &&
        room.shelterId.toString() !== socket.userId.toString()
      ) {
        return safeEmit(socket, "chat:error", {
          message: "Access denied",
        });
      }

      socket.join(`room:${roomId}`);
      console.log(`User ${socket.userId} joined room ${roomId}`);

      const recipientId =
        socket.userId.toString() === room.ownerId.toString()
          ? room.shelterId.toString()
          : room.ownerId.toString();

      io.to(`user:${recipientId}`).emit("user:online", {
        userId: socket.userId,
        roomId,
      });

      const unreadMessages = await RoomChatMessage.find({
        roomId,
        senderId: { $ne: socket.userId },
        "readBy.userId": { $ne: socket.userId },
      }).lean();

      if (unreadMessages.length > 0) {
        await RoomChatMessage.updateMany(
          {
            roomId,
            senderId: { $ne: socket.userId },
            "readBy.userId": { $ne: socket.userId },
          },
          {
            $push: {
              readBy: {
                userId: socket.userId,
                readAt: new Date(),
              },
            },
          }
        );

        for (const msg of unreadMessages) {
          io.to(`user:${msg.senderId.toString()}`).emit("chat:message:read", {
            messageId: msg._id.toString(),
            roomId: roomId,
            readBy: socket.userId,
            readAt: new Date(),
          });
        }
      }

      safeEmit(socket, "chat:joined", {
        roomId,
        success: true,
      });

      const undeliveredMessages = await RoomChatMessage.find({
        roomId,
        senderId: { $ne: socket.userId },
        "deliveredTo.userId": { $ne: socket.userId },
      }).lean();

      if (undeliveredMessages.length > 0) {
        await RoomChatMessage.updateMany(
          {
            roomId,
            senderId: { $ne: socket.userId },
            "deliveredTo.userId": { $ne: socket.userId },
          },
          {
            $push: {
              deliveredTo: {
                userId: socket.userId,
                deliveredAt: new Date(),
              },
            },
          }
        );

        for (const msg of undeliveredMessages) {
          io.to(`user:${msg.senderId.toString()}`).emit(
            "chat:message:delivered",
            {
              messageId: msg._id.toString(),
              roomId: roomId,
              userId: socket.userId,
              deliveredAt: new Date(),
            }
          );
        }
      }
    } catch (error) {
      console.error("Chat join error:", error);
      safeEmit(socket, "chat:error", {
        message: "Failed to join chat",
      });
    }
  });

  socket.on("chat:leave", async ({ roomId }) => {
    try {
      socket.leave(`room:${roomId}`);
      console.log(`User ${socket.userId} left room ${roomId}`);

      const room = await RoomChatPet.findById(roomId).lean();
      if (room) {
        const recipientId =
          socket.userId.toString() === room.ownerId.toString()
            ? room.shelterId.toString()
            : room.ownerId.toString();

        io.to(`user:${recipientId}`).emit("user:offline", {
          userId: socket.userId,
          roomId: roomId,
        });
      }
    } catch (error) {
      console.error("Chat leave error:", error);
    }
  });

  socket.on("chat:typing", async ({ roomId, isTyping }) => {
    try {
      const room = await RoomChatPet.findById(roomId);

      if (!room) return;

      room.participantTyping = {
        userId: isTyping ? socket.userId : null,
        isTyping,
        lastTypingAt: isTyping ? new Date() : null,
      };

      await room.save();

      const recipientId =
        socket.userRole === "owner"
          ? room.shelterId.toString()
          : room.ownerId.toString();

      io.to(`user:${recipientId}`).emit("chat:user:typing", {
        roomId,
        userId: socket.userId,
        isTyping,
      });
    } catch (error) {
      console.error("Typing indicator error:", error);
    }
  });

  socket.on("chat:mark:read", async ({ roomId }) => {
    try {
      const room = await RoomChatPet.findById(roomId);
      const RoomChatMessage = (
        await import("../../models/rooms/RoomChatMessage.js")
      ).default;
      if (!room) return;

      if (socket.userRole === "owner") {
        room.unreadCount.owner = 0;
      } else {
        room.unreadCount.shelter = 0;
      }
      await room.save();

      const unreadMessages = await RoomChatMessage.find({
        roomId,
        senderId: { $ne: socket.userId },
        "readBy.userId": { $ne: socket.userId },
      }).lean();

      if (unreadMessages.length > 0) {
        await RoomChatMessage.updateMany(
          {
            roomId,
            senderId: { $ne: socket.userId },
            "readBy.userId": { $ne: socket.userId },
          },
          {
            $push: {
              readBy: {
                userId: socket.userId,
                readAt: new Date(),
              },
            },
          }
        );

        const recipientId =
          socket.userRole === "owner"
            ? room.shelterId.toString()
            : room.ownerId.toString();

        for (const msg of unreadMessages) {
          io.to(`user:${msg.senderId.toString()}`).emit("chat:message:read", {
            messageId: msg._id.toString(),
            roomId: roomId,
            readBy: socket.userId,
            readAt: new Date(),
          });
        }
      }
    } catch (error) {
      console.error("Mark read error:", error);
    }
  });

  socket.on("disconnect", async () => {
    try {
      // Notify all rooms this user was in
      const rooms = await RoomChatPet.find({
        $or: [{ ownerId: socket.userId }, { shelterId: socket.userId }],
      }).lean();

      for (const room of rooms) {
        const recipientId =
          socket.userId.toString() === room.ownerId.toString()
            ? room.shelterId.toString()
            : room.ownerId.toString();

        io.to(`user:${recipientId}`).emit("user:offline", {
          userId: socket.userId,
          roomId: room._id.toString(),
        });
      }
    } catch (error) {
      console.error("Disconnect notify error:", error);
    }
  });
};
