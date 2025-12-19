import OwnerProfile from "../../models/profiles/OwnerProfile.js";
import Notification from "../../models/notifications/Notification.js";
import { uploadToCloudinary } from "../../services/cloudinary.service.js";

const ownerProfileController = {
  getProfile: async (req, res) => {
    try {
      const profile = await OwnerProfile.findOne({
        ownerId: req.userId,
      }).populate("ownerId", "email role mode tempPassword passwordChanged");

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      return res.json({
        success: true,
        profile: {
          ...profile.toObject(),
          email: profile.ownerId.email,
          role: profile.ownerId.role,
          mode: profile.ownerId.mode,
          tempPassword:
            profile.ownerId.mode === "google"
              ? profile.ownerId.tempPassword
              : null,
          passwordChanged: profile.ownerId.passwordChanged,
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
      });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { name, phone, address, bio } = req.body;

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (bio !== undefined) updateData.bio = bio;

      const profile = await OwnerProfile.findOneAndUpdate(
        { ownerId: req.userId },
        updateData,
        { new: true, runValidators: true }
      ).populate("ownerId", "email role");

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      // Create notification

      const notification = new Notification({
        userId: req.userId,
        userModel: "OwnerLogin",
        type: "profile",
        title: "Profile Updated",
        message: "Your profile has been updated successfully",
        metadata: { updatedFields: Object.keys(updateData) },
      });
      await notification.save();

      // Emit socket notification
      if (global.io) {
        global.io.to(`user:${req.userId}`).emit("notification:new", {
          type: "success",
          title: "Profile Updated",
          message: "Your profile has been updated successfully",
          timestamp: Date.now(),
        });
      }

      return res.json({
        success: true,
        message: "Profile updated successfully",
        profile: {
          ...profile.toObject(),
          email: profile.ownerId.email,
          role: profile.ownerId.role,
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
      });
    }
  },

  updateAvatar: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // Upload to Cloudinary
      const result = await uploadToCloudinary(
        req.file.buffer,
        "whispertails/avatars/owners"
      );

      // Update profile with new avatar URL
      const profile = await OwnerProfile.findOneAndUpdate(
        { ownerId: req.userId },
        { avatar: result.secure_url },
        { new: true }
      ).populate("ownerId", "email role");

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      // Create notification
      const notification = new Notification({
        userId: req.userId,
        userModel: "OwnerLogin",
        type: "avatar",
        title: "Avatar Updated",
        message: "Your profile picture has been updated successfully",
        metadata: { avatarUrl: result.secure_url },
      });
      await notification.save();

      // Emit socket notification
      if (global.io) {
        global.io.to(`user:${req.userId}`).emit("notification:new", {
          type: "success",
          title: "Avatar Updated",
          message: "Your profile picture has been updated successfully",
          timestamp: Date.now(),
        });
      }

      return res.json({
        success: true,
        message: "Avatar updated successfully",
        avatar: result.secure_url,
        profile: {
          ...profile.toObject(),
          email: profile.ownerId.email,
          role: profile.ownerId.role,
        },
      });
    } catch (error) {
      console.error("Update avatar error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update avatar",
      });
    }
  },
};

export default ownerProfileController;
