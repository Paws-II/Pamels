import bcrypt from "bcryptjs";
import CheckLogin from "../models/loginSystem/CheckLogin.js";
import OwnerLogin from "../models/loginSystem/OwnerLogin.js";
import OwnerProfile from "../models/profiles/OwnerProfile.js";

import { generateOTP, sendOTPEmail } from "../config/emailService.js";
import {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
} from "../config/jwtConfig.js";

const ownerAuthController = {
  checkEmail: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Email is required" });
      }

      const existing = await CheckLogin.findOne({ email });
      if (existing) {
        return res.json({ success: false, message: "Email already exists" });
      }

      return res.json({ success: true, message: "Email available" });
    } catch (err) {
      console.error("Check email error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to check email" });
    }
  },

  signup: async (req, res) => {
    try {
      const { email, password, confirmPassword } = req.body;

      if (!email || !password || !confirmPassword) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required" });
      }

      if (password !== confirmPassword) {
        return res
          .status(400)
          .json({ success: false, message: "Passwords do not match" });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long",
        });
      }

      const existing = await CheckLogin.findOne({ email });
      if (existing) {
        return res
          .status(400)
          .json({ success: false, message: "Email already exists" });
      }

      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const hashedPassword = await bcrypt.hash(password, 12);

      const ownerLogin = new OwnerLogin({
        email,
        password: hashedPassword,
        role: "owner",
        mode: "manual",
        otp,
        otpExpiresAt,
        otpVerified: false,
      });
      await ownerLogin.save();

      const ownerProfile = new OwnerProfile({
        ownerId: ownerLogin._id,
        email: ownerLogin.email,
        role: "owner",
      });
      await ownerProfile.save();

      const checkLogin = new CheckLogin({
        email,
        password: hashedPassword,
        role: "owner",
        loginMode: "manual",
        userRef: ownerLogin._id,
        roleRef: "OwnerLogin",
      });
      await checkLogin.save();

      await sendOTPEmail(email, otp, "New Owner", "verification");

      return res.status(201).json({
        success: true,
        message:
          "Signup successful! Please verify your email with the OTP sent.",
        requiresVerification: true,
      });
    } catch (err) {
      console.error("Owner signup error:", err);
      return res.status(500).json({ success: false, message: "Signup failed" });
    }
  },

  verifyOTP: async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res
          .status(400)
          .json({ success: false, message: "Email and OTP are required" });
      }

      const ownerLogin = await OwnerLogin.findOne({
        email,
        otp,
        otpExpiresAt: { $gt: new Date() },
        otpVerified: false,
      });

      if (!ownerLogin) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired OTP" });
      }

      ownerLogin.otpVerified = true;
      ownerLogin.otp = null;
      ownerLogin.otpExpiresAt = null;
      await ownerLogin.save();

      const token = generateToken(ownerLogin._id, "owner");
      setTokenCookie(res, token);

      return res.json({
        success: true,
        message: "Email verified successfully!",
        token,
        user: {
          _id: ownerLogin._id,
          email: ownerLogin.email,
          role: ownerLogin.role,
        },
      });
    } catch (err) {
      console.error("OTP verification error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to verify OTP" });
    }
  },

  resendOTP: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Email is required" });
      }

      const ownerLogin = await OwnerLogin.findOne({
        email,
        otpVerified: false,
      });
      if (!ownerLogin) {
        return res.status(404).json({
          success: false,
          message: "No pending verification found for this email",
        });
      }

      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      ownerLogin.otp = otp;
      ownerLogin.otpExpiresAt = otpExpiresAt;
      await ownerLogin.save();

      await sendOTPEmail(email, otp, "Owner", "verification");

      return res.json({
        success: true,
        message: "New OTP sent to your email",
      });
    } catch (err) {
      console.error("Resend OTP error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to resend OTP" });
    }
  },

  getProfile: async (req, res) => {
    try {
      const ownerProfile = await OwnerProfile.findOne({
        ownerId: req.userId,
      }).populate("ownerId", "-password -otp -otpExpiresAt");

      if (!ownerProfile) {
        return res
          .status(404)
          .json({ success: false, message: "Profile not found" });
      }

      return res.json({ success: true, profile: ownerProfile });
    } catch (err) {
      console.error("Get profile error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to get profile" });
    }
  },

  logout: (req, res) => {
    try {
      clearTokenCookie(res);
      return res.json({ success: true, message: "Logged out successfully" });
    } catch (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
  },
};

export default ownerAuthController;
