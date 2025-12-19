import jwt from "jsonwebtoken";
import OwnerLogin from "../models/loginSystem/OwnerLogin.js";
import ShelterLogin from "../models/loginSystem/ShelterLogin.js";

const socketAuth = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.cookie?.split("access_token=")[1]?.split(";")[0];

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = null;

    if (decoded.role === "owner") {
      user = await OwnerLogin.findById(decoded.userId).select("-password");
    } else if (decoded.role === "shelter") {
      user = await ShelterLogin.findById(decoded.userId).select("-password");
    }

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    socket.userEmail = user.email;

    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error("Invalid token"));
  }
};

export default socketAuth;
