import RoomChatPet from "../../models/rooms/RoomChatPet.js";
import { safeEmit } from "../utils/socketHelpers.js";

export const setupChatHandlers = (io, socket) => {
  // Join chat room
  socket.on("chat:join", async ({ roomId }) => {
    try {
      const room = await RoomChatPet.findById(roomId).lean();

      if (!room) {
        return safeEmit(socket, "chat:error", {
          message: "Room not found",
        });
      }

      // Verify access
      if (
        room.shelterId.toString() !== socket.userId.toString() &&
        room.ownerId.toString() !== socket.userId.toString()
      ) {
        return safeEmit(socket, "chat:error", {
          message: "Access denied",
        });
      }

      socket.join(`room:${roomId}`);

      safeEmit(socket, "chat:joined", {
        roomId,
        timestamp: Date.now(),
      });

      // Notify other participant
      socket.to(`room:${roomId}`).emit("chat:user:online", {
        userId: socket.userId,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Chat join error:", error);
      safeEmit(socket, "chat:error", {
        message: "Failed to join room",
      });
    }
  });

  // Leave chat room
  socket.on("chat:leave", ({ roomId }) => {
    socket.leave(`room:${roomId}`);
    socket.to(`room:${roomId}`).emit("chat:user:offline", {
      userId: socket.userId,
      timestamp: Date.now(),
    });
  });

  // Typing indicator
  socket.on("chat:typing", async ({ roomId, isTyping }) => {
    try {
      const room = await RoomChatPet.findById(roomId);

      if (room) {
        room.participantTyping = {
          userId: isTyping ? socket.userId : null,
          isTyping,
          lastTypingAt: isTyping ? new Date() : null,
        };
        await room.save();

        socket.to(`room:${roomId}`).emit("chat:typing:update", {
          userId: socket.userId,
          isTyping,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Typing indicator error:", error);
    }
  });

  // New message notification
  socket.on("chat:message:sent", ({ roomId, message }) => {
    socket.to(`room:${roomId}`).emit("chat:message:new", {
      message,
      timestamp: Date.now(),
    });
  });

  // Message delivered
  socket.on("chat:message:delivered", ({ roomId, messageId }) => {
    socket.to(`room:${roomId}`).emit("chat:message:delivered", {
      messageId,
      userId: socket.userId,
      timestamp: Date.now(),
    });
  });

  // Message read
  socket.on("chat:message:read", ({ roomId, messageIds }) => {
    socket.to(`room:${roomId}`).emit("chat:message:read", {
      messageIds,
      userId: socket.userId,
      timestamp: Date.now(),
    });
  });

  // Message deleted
  socket.on(
    "chat:message:deleted",
    ({ roomId, messageId, deletedForEveryone }) => {
      socket.to(`room:${roomId}`).emit("chat:message:deleted", {
        messageId,
        deletedForEveryone,
        timestamp: Date.now(),
      });
    }
  );

  // Reaction added
  socket.on("chat:reaction:added", ({ roomId, messageId, emoji }) => {
    socket.to(`room:${roomId}`).emit("chat:reaction:added", {
      messageId,
      userId: socket.userId,
      emoji,
      timestamp: Date.now(),
    });
  });

  // Room status changed
  socket.on("chat:room:status", ({ roomId, status }) => {
    socket.to(`room:${roomId}`).emit("chat:room:status:changed", {
      roomId,
      status,
      timestamp: Date.now(),
    });
  });
};
