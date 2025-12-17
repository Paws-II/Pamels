import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./connection/conn.js";
import passport from "./config/passport.js";
import session from "express-session";

import ownerAuthRoutes from "./routes/ownerAuthRoutes.js";
import shelterAuthRoutes from "./routes/shelterAuthRoutes.js";
import unifiedAuthRoutes from "./routes/unifiedAuthRoutes.js";
import forgotPasswordRoutes from "./routes/forgotPasswordRoutes.js";

const app = express();
const PORT = process.env.PORT || 8000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: [CLIENT_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
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

app.get("/", (req, res) => {
  res.send({ message: "Pamels API is working" });
});

const startServer = async () => {
  app.listen(PORT, () => {
    console.log("Server running on port:", PORT);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
