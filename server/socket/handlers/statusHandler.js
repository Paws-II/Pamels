import { emitToRole, safeEmit } from "../utils/socketHelpers.js";

export const setupStatusHandlers = (io, socket) => {
  socket.on("status:update", async (payload) => {
    try {
      const { status, details } = payload;

      console.log(`User ${socket.userId} status update:`, status);

      if (socket.userRole === "owner") {
        emitToRole(io, "shelter", "owner:status:changed", {
          userId: socket.userId,
          status,
          details,
          timestamp: Date.now(),
        });
      } else if (socket.userRole === "shelter") {
        emitToRole(io, "owner", "shelter:status:changed", {
          userId: socket.userId,
          status,
          details,
          timestamp: Date.now(),
        });
      }

      safeEmit(socket, "status:update:ack", {
        success: true,
      });
    } catch (error) {
      console.error("Status update error:", error);

      safeEmit(socket, "status:error", {
        message: "Failed to update status",
      });
    }
  });

  socket.on("status:subscribe", (payload) => {
    const { targetUserId } = payload;

    socket.join(`status:${targetUserId}`);
    console.log(
      `User ${socket.userId} subscribed to status of ${targetUserId}`
    );
  });

  socket.on("status:unsubscribe", (payload) => {
    const { targetUserId } = payload;

    socket.leave(`status:${targetUserId}`);
    console.log(
      `User ${socket.userId} unsubscribed from status of ${targetUserId}`
    );
  });
};

export const broadcastStatusChange = (io, userId, status, details) => {
  io.to(`status:${userId}`).emit("status:changed", {
    userId,
    status,
    details,
    timestamp: Date.now(),
  });
};
