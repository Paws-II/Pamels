import { emitToUser, safeEmit } from "../utils/socketHelpers.js";

export const setupNotificationHandlers = (io, socket) => {
  socket.on("notification:read", async (payload) => {
    try {
      const { notificationId } = payload;

      console.log(`User ${socket.userId} read notification ${notificationId}`);

      safeEmit(socket, "notification:read:ack", {
        notificationId,
        success: true,
      });
    } catch (error) {
      console.error("Notification read error:", error);

      safeEmit(socket, "notification:error", {
        message: "Failed to mark as read",
      });
    }
  });

  socket.on("notification:read:all", async () => {
    try {
      console.log(`User ${socket.userId} marked all notifications as read`);

      safeEmit(socket, "notification:read:all:ack", {
        success: true,
      });
    } catch (error) {
      console.error("Mark all read error:", error);

      safeEmit(socket, "notification:error", {
        message: "Failed to mark all as read",
      });
    }
  });
};

export const sendNotification = (io, userId, notificationData) => {
  emitToUser(io, userId, "notification:new", {
    ...notificationData,
    timestamp: Date.now(),
  });
};
