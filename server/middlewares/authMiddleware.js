import jwt from "jsonwebtoken";
import OwnerLogin from "../models/loginSystem/OwnerLogin.js";
import TrainerLogin from "../models/loginSystem/TrainerLogin.js";

const extractToken = (req) => {
  let token = null;

  const authHeader = req?.headers?.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  if (!token && req?.cookies?.access_token) {
    token = req.cookies.access_token;
  }

  return token;
};

const authenticateJWT = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = null;
    if (decoded.role === "owner") {
      user = await OwnerLogin.findById(decoded.userId).select("-password");
    } else if (decoded.role === "trainer") {
      user = await TrainerLogin.findById(decoded.userId).select("-password");
    }

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    req.user = user;
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    return next();
  } catch (err) {
    console.error("JWT Authentication Error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }

    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

const authorizeRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    return next();
  };

export { authenticateJWT, authorizeRole };
