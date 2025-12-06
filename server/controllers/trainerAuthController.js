import bcrypt from "bcryptjs";
import CheckLogin from "../models/loginSystem/CheckLogin.js";
import TrainerLogin from "../models/loginSystem/TrainerLogin.js";
import TrainerProfile from "../models/profiles/TrainerProfile.js";

import { generateOTP, sendOTPEmail } from "../config/emailService.js";
import {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
} from "../config/jwtConfig.js";

const trainerAuthController = {
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

      const existingEmail = await CheckLogin.findOne({ email });
      if (existingEmail) {
        return res
          .status(400)
          .json({ success: false, message: "Email already exists" });
      }

      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const trainerLogin = new TrainerLogin({
        email,
        password: hashedPassword,
        role: "trainer",
        mode: "manual",
        otp,
        otpExpiresAt,
        otpVerified: false,
      });
      await trainerLogin.save();

      const trainerProfile = new TrainerProfile({
        trainerId: trainerLogin._id,
        email: trainerLogin.email,
        role: "trainer",
      });
      await trainerProfile.save();

      const checkLogin = new CheckLogin({
        email,
        password: hashedPassword,
        role: "trainer",
        loginMode: "manual",
        userRef: trainerLogin._id,
        roleRef: "TrainerLogin",
      });
      await checkLogin.save();

      await sendOTPEmail(email, otp, "New Trainer", "verification");

      return res.status(201).json({
        success: true,
        message:
          "Signup successful! Please verify your email with the OTP sent.",
        requiresVerification: true,
        devOTP: process.env.NODE_ENV === "development" ? otp : undefined,
      });
    } catch (err) {
      console.error("Trainer signup error:", err);
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

      const trainerLogin = await TrainerLogin.findOne({
        email,
        otp,
        otpExpiresAt: { $gt: new Date() },
        otpVerified: false,
      });

      if (!trainerLogin) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired OTP" });
      }

      trainerLogin.otpVerified = true;
      trainerLogin.otp = null;
      trainerLogin.otpExpiresAt = null;
      await trainerLogin.save();

      const token = generateToken(trainerLogin._id, "trainer");
      setTokenCookie(res, token);

      return res.json({
        success: true,
        message: "Email verified successfully!",
        token,
        user: {
          _id: trainerLogin._id,
          email: trainerLogin.email,
          role: trainerLogin.role,
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

      const trainerLogin = await TrainerLogin.findOne({
        email,
        otpVerified: false,
      });

      if (!trainerLogin) {
        return res.status(404).json({
          success: false,
          message: "No pending verification found for this email",
        });
      }

      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      trainerLogin.otp = otp;
      trainerLogin.otpExpiresAt = otpExpiresAt;
      await trainerLogin.save();

      await sendOTPEmail(email, otp, "Trainer", "verification");

      return res.json({
        success: true,
        message: "New OTP sent to your email",
        devOTP: process.env.NODE_ENV === "development" ? otp : undefined,
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
      const trainerProfile = await TrainerProfile.findOne({
        trainerId: req.userId,
      }).populate("trainerId", "-password -otp -otpExpiresAt");

      if (!trainerProfile) {
        return res
          .status(404)
          .json({ success: false, message: "Profile not found" });
      }

      return res.json({ success: true, profile: trainerProfile });
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

export default trainerAuthController;
