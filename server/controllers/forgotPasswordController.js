import bcrypt from "bcryptjs";
import CheckLogin from "../models/loginSystem/CheckLogin.js";
import OwnerLogin from "../models/loginSystem/OwnerLogin.js";
import ShelterLogin from "../models/loginSystem/ShelterLogin.js";
import { generateOTP, sendOTPEmail } from "../config/emailService.js";

const forgotPasswordController = {
  requestOTP: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Email is required" });
      }

      const checkLogin = await CheckLogin.findOne({ email });
      if (!checkLogin) {
        return res
          .status(404)
          .json({ success: false, message: "Email not found" });
      }

      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      let userLogin = null;
      if (checkLogin.role === "owner") {
        userLogin = await OwnerLogin.findById(checkLogin.userRef);
      } else if (checkLogin.role === "shelter") {
        userLogin = await ShelterLogin.findById(checkLogin.userRef);
      }

      if (!userLogin) {
        return res
          .status(404)
          .json({ success: false, message: "User account not found" });
      }

      userLogin.otp = otp;
      userLogin.otpExpiresAt = otpExpiresAt;
      await userLogin.save();

      await sendOTPEmail(email, otp, "User", "password-reset");

      return res.json({
        success: true,
        message: "OTP sent to your email",
      });
    } catch (err) {
      console.error("Request OTP error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP" });
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

      const checkLogin = await CheckLogin.findOne({ email });
      if (!checkLogin) {
        return res
          .status(404)
          .json({ success: false, message: "Email not found" });
      }

      let userLogin = null;
      if (checkLogin.role === "owner") {
        userLogin = await OwnerLogin.findOne({
          _id: checkLogin.userRef,
          otp,
          otpExpiresAt: { $gt: new Date() },
        });
      } else if (checkLogin.role === "shelter") {
        userLogin = await ShelterLogin.findOne({
          _id: checkLogin.userRef,
          otp,
          otpExpiresAt: { $gt: new Date() },
        });
      }

      if (!userLogin) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired OTP" });
      }

      return res.json({
        success: true,
        message: "OTP verified successfully",
      });
    } catch (err) {
      console.error("Verify OTP error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to verify OTP" });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long",
        });
      }

      const checkLogin = await CheckLogin.findOne({ email });
      if (!checkLogin) {
        return res
          .status(404)
          .json({ success: false, message: "Email not found" });
      }

      let userLogin = null;
      if (checkLogin.role === "owner") {
        userLogin = await OwnerLogin.findOne({
          _id: checkLogin.userRef,
          otp,
          otpExpiresAt: { $gt: new Date() },
        });
      } else if (checkLogin.role === "shelter") {
        userLogin = await ShelterLogin.findOne({
          _id: checkLogin.userRef,
          otp,
          otpExpiresAt: { $gt: new Date() },
        });
      }

      if (!userLogin) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired OTP" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      userLogin.password = hashedPassword;
      userLogin.otp = null;
      userLogin.otpExpiresAt = null;
      await userLogin.save();

      checkLogin.password = hashedPassword;
      await checkLogin.save();

      return res.json({ success: true, message: "Password reset successful" });
    } catch (err) {
      console.error("Reset password error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to reset password" });
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

      const checkLogin = await CheckLogin.findOne({ email });
      if (!checkLogin) {
        return res
          .status(404)
          .json({ success: false, message: "Email not found" });
      }

      let userLogin = null;
      if (checkLogin.role === "owner") {
        userLogin = await OwnerLogin.findById(checkLogin.userRef);
      } else if (checkLogin.role === "shelter") {
        userLogin = await ShelterLogin.findById(checkLogin.userRef);
      }

      if (!userLogin) {
        return res
          .status(404)
          .json({ success: false, message: "User account not found" });
      }

      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      userLogin.otp = otp;
      userLogin.otpExpiresAt = otpExpiresAt;
      await userLogin.save();

      await sendOTPEmail(email, otp, "User", "password-reset");

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
};

export default forgotPasswordController;
