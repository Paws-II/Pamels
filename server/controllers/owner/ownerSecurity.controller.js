import bcrypt from "bcryptjs";
import OwnerLogin from "../../models/loginSystem/OwnerLogin.js";
import OwnerProfile from "../../models/profiles/OwnerProfile.js";
import Notification from "../../models/notifications/Notification.js";
import {
  generateAndStoreOTP,
  verifyOTP,
  sendPasswordChangeOTP,
} from "../../services/otp.service.js";

const ownerSecurityController = {
  requestPasswordChangeOTP: async (req, res) => {
    try {
      const ownerLogin = await OwnerLogin.findById(req.userId);

      if (!ownerLogin) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const { plainOTP, hashedOTP, otpExpiresAt } = await generateAndStoreOTP();

      ownerLogin.securityOTP = hashedOTP;
      ownerLogin.securityOTPExpiresAt = otpExpiresAt;
      await ownerLogin.save();

      const profile = await OwnerProfile.findOne({ ownerId: req.userId });

      await sendPasswordChangeOTP(
        ownerLogin.email,
        profile?.name || "Owner",
        plainOTP
      );

      return res.json({
        success: true,
        message: "OTP sent to your email",
      });
    } catch (error) {
      console.error("Request OTP error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
      });
    }
  },

  verifyPasswordChangeOTP: async (req, res) => {
    try {
      const { otp } = req.body;

      if (!otp) {
        return res.status(400).json({
          success: false,
          message: "OTP is required",
        });
      }

      const ownerLogin = await OwnerLogin.findById(req.userId);

      if (!ownerLogin) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (
        !ownerLogin.securityOTP ||
        !ownerLogin.securityOTPExpiresAt ||
        ownerLogin.securityOTPExpiresAt < new Date()
      ) {
        return res.status(400).json({
          success: false,
          message: "OTP expired or not requested",
        });
      }

      const isValid = await verifyOTP(otp, ownerLogin.securityOTP);

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      return res.json({
        success: true,
        message: "OTP verified successfully",
      });
    } catch (error) {
      console.error("Verify OTP error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to verify OTP",
      });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { otp, newPassword, confirmPassword } = req.body;

      if (!otp || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Passwords do not match",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long",
        });
      }

      const ownerLogin = await OwnerLogin.findById(req.userId);

      if (!ownerLogin) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (
        !ownerLogin.securityOTP ||
        !ownerLogin.securityOTPExpiresAt ||
        ownerLogin.securityOTPExpiresAt < new Date()
      ) {
        return res.status(400).json({
          success: false,
          message: "OTP expired or not verified",
        });
      }

      const isValid = await verifyOTP(otp, ownerLogin.securityOTP);

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      ownerLogin.password = hashedPassword;
      ownerLogin.tempPassword = null;
      ownerLogin.passwordChanged = true;
      ownerLogin.securityOTP = null;
      ownerLogin.securityOTPExpiresAt = null;
      await ownerLogin.save();

      // Create notification
      const notification = new Notification({
        userId: req.userId,
        userModel: "OwnerLogin",
        type: "security",
        title: "Password Changed",
        message: "Your password has been changed successfully",
      });
      await notification.save();

      // Emit socket notification
      if (global.io) {
        global.io.to(`user:${req.userId}`).emit("notification:new", {
          type: "success",
          title: "Password Changed",
          message: "Your password has been changed successfully",
          timestamp: Date.now(),
        });
      }

      return res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to change password",
      });
    }
  },
};

export default ownerSecurityController;
