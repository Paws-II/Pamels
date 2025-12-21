import { Server } from "socket.io";
import socketAuth from "./auth.js";
import { setupDashboardHandlers } from "./handlers/dashboardHandler.js";
import { setupNotificationHandlers } from "./handlers/notificationHandler.js";
import { setupStatusHandlers } from "./handlers/statusHandler.js";
import { setupChatHandlers } from "./handlers/chatHandler.js";

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(
      `✓ Socket connected: ${socket.id} | User: ${socket.userId} | Role: ${socket.userRole}`
    );

    socket.join(`user:${socket.userId}`);
    socket.join(`role:${socket.userRole}`);

    socket.emit("connection:success", {
      userId: socket.userId,
      role: socket.userRole,
      timestamp: Date.now(),
    });

    setupDashboardHandlers(io, socket);
    setupNotificationHandlers(io, socket);
    setupStatusHandlers(io, socket);
    setupChatHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      console.log(`✗ Socket disconnected: ${socket.id} | Reason: ${reason}`);
    });

    socket.on("error", (err) => {
      console.error(`Socket error for ${socket.id}:`, err);
    });
  });

  global.io = io;
  console.log("✓ Socket.IO initialized successfully");
  return io;
};
