import { safeEmit } from "../utils/socketHelpers.js";

export const setupDashboardHandlers = (io, socket) => {
  socket.on("dashboard:subscribe", () => {
    console.log(`User ${socket.userId} subscribed to dashboard updates`);

    safeEmit(socket, "dashboard:subscribed", {
      success: true,
    });
  });

  socket.on("dashboard:unsubscribe", () => {
    console.log(`User ${socket.userId} unsubscribed from dashboard updates`);
  });

  socket.on("dashboard:refresh", async () => {
    try {
      safeEmit(socket, "dashboard:refresh:ack", {
        success: true,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Dashboard refresh error:", error);

      safeEmit(socket, "dashboard:error", {
        message: "Failed to refresh",
      });
    }
  });
};

export const broadcastDashboardUpdate = (io, userId, updateType, payload) => {
  io.to(`user:${userId}`).emit("dashboard:update", {
    type: updateType,
    data: payload,
    timestamp: Date.now(),
  });
};
