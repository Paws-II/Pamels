import bcrypt from "bcryptjs";
import CheckLogin from "../../models/loginSystem/CheckLogin.js";
import ShelterLogin from "../../models/loginSystem/ShelterLogin.js";
import ShelterProfile from "../../models/profiles/ShelterProfile.js";

import { generateOTP, sendOTPEmail } from "../../config/emailService.js";
import {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
} from "../../config/jwtConfig.js";

const shelterAuthController = {
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

      const shelterLogin = new ShelterLogin({
        email,
        password: hashedPassword,
        role: "shelter",
        mode: "manual",
        otp,
        otpExpiresAt,
        otpVerified: false,
      });
      await shelterLogin.save();

      const shelterProfile = new ShelterProfile({
        shelterId: shelterLogin._id,
        email: shelterLogin.email,
        role: "shelter",
      });
      await shelterProfile.save();

      const checkLogin = new CheckLogin({
        email,
        password: hashedPassword,
        role: "shelter",
        loginMode: "manual",
        userRef: shelterLogin._id,
        roleRef: "ShelterLogin",
      });
      await checkLogin.save();

      await sendOTPEmail(email, otp, "New Shelter", "verification");

      return res.status(201).json({
        success: true,
        message:
          "Signup successful! Please verify your email with the OTP sent.",
        requiresVerification: true,
        devOTP: process.env.NODE_ENV === "development" ? otp : undefined,
      });
    } catch (err) {
      console.error("Shelter signup error:", err);
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

      const shelterLogin = await ShelterLogin.findOne({
        email,
        otp,
        otpExpiresAt: { $gt: new Date() },
        otpVerified: false,
      });

      if (!shelterLogin) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired OTP" });
      }

      shelterLogin.otpVerified = true;
      shelterLogin.otp = null;
      shelterLogin.otpExpiresAt = null;
      await shelterLogin.save();

      const token = generateToken(shelterLogin._id, "shelter");
      setTokenCookie(res, token);

      return res.json({
        success: true,
        message: "Email verified successfully!",
        token,
        user: {
          _id: shelterLogin._id,
          email: shelterLogin.email,
          role: shelterLogin.role,
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

      const shelterLogin = await ShelterLogin.findOne({
        email,
        otpVerified: false,
      });

      if (!shelterLogin) {
        return res.status(404).json({
          success: false,
          message: "No pending verification found for this email",
        });
      }

      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      shelterLogin.otp = otp;
      shelterLogin.otpExpiresAt = otpExpiresAt;
      await shelterLogin.save();

      await sendOTPEmail(email, otp, "Shelter", "verification");

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
      const shelterProfile = await ShelterProfile.findOne({
        shelterId: req.userId,
      }).populate("shelterId", "-password -otp -otpExpiresAt");

      if (!shelterProfile) {
        return res
          .status(404)
          .json({ success: false, message: "Profile not found" });
      }

      return res.json({ success: true, profile: shelterProfile });
    } catch (err) {
      console.error("Get profile error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to get profile" });
    }
  },

  getProfileWithAuth: async (req, res) => {
    try {
      const shelterProfile = await ShelterProfile.findOne({
        shelterId: req.userId,
      }).populate("shelterId", "-password -otp -otpExpiresAt");

      if (!shelterProfile) {
        return res
          .status(404)
          .json({ success: false, message: "Profile not found" });
      }

      const shelterLogin = await ShelterLogin.findById(req.userId);

      return res.json({
        success: true,
        profile: {
          ...shelterProfile.toObject(),
          mode: shelterLogin.mode,
          tempPassword:
            shelterLogin.mode === "google" ? shelterLogin.tempPassword : null,
        },
      });
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

export default shelterAuthController;
