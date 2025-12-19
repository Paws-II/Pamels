import dotenv from "dotenv";
dotenv.config({ quiet: true });

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./connection/conn.js";
import passport from "./config/passport.js";
import session from "express-session";
import { createServer } from "http";
import { initializeSocket } from "./socket/index.js";

import ownerAuthRoutes from "./routes/auth/ownerAuthRoutes.js";
import shelterAuthRoutes from "./routes/auth/shelterAuthRoutes.js";
import unifiedAuthRoutes from "./routes/auth/unifiedAuthRoutes.js";
import forgotPasswordRoutes from "./routes/auth/forgotPasswordRoutes.js";
import ownerProfileRoutes from "./routes/owner/ownerProfile.js";
import ownerSecurityRoutes from "./routes/owner/ownerSecurity.js";
import shelterProfileRoutes from "./routes/shelter/shelterProfile.js";
import shelterDashboardRoutes from "./routes/shelter/shelterDashboard.js";
import shelterSecurityRoutes from "./routes/shelter/shelterSecurity.js";
import notificationRoutes from "./routes/notifications/notificationRoutes.js";

const app = express();
const PORT = process.env.PORT || 8000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: [CLIENT_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth/owner", ownerAuthRoutes);
app.use("/api/auth/shelter", shelterAuthRoutes);
app.use("/api/auth", unifiedAuthRoutes);
app.use("/api/auth/forgot-password", forgotPasswordRoutes);
app.use("/api/owner/profile", ownerProfileRoutes);
app.use("/api/owner/security", ownerSecurityRoutes);
app.use("/api/shelter/profile", shelterProfileRoutes);
app.use("/api/shelter/dashboard", shelterDashboardRoutes);
app.use("/api/shelter/security", shelterSecurityRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send({ message: "WhisperTails API is working" });
});

const startServer = async () => {
  const httpServer = createServer(app);

  initializeSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log("Server running on port:", PORT);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
