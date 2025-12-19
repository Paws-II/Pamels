import Notification from "../../models/notifications/Notification.js";

const notificationController = {
  getNotifications: async (req, res) => {
    try {
      const userModel =
        req.userRole === "owner" ? "OwnerLogin" : "ShelterLogin";

      const notifications = await Notification.find({
        userId: req.userId,
        userModel: userModel,
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      const unreadCount = await Notification.countDocuments({
        userId: req.userId,
        userModel: userModel,
        read: false,
      });

      return res.json({
        success: true,
        notifications,
        unreadCount,
      });
    } catch (error) {
      console.error("Get notifications error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
      });
    }
  },

  markAsRead: async (req, res) => {
    try {
      const { notificationId } = req.params;
      const userModel =
        req.userRole === "owner" ? "OwnerLogin" : "ShelterLogin";

      console.log("Mark as read attempt:", {
        notificationId,
        userId: req.userId,
        userModel,
        userRole: req.userRole,
      });

      const notification = await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          userId: req.userId,
          userModel: userModel,
        },
        { $set: { read: true } },
        { new: true }
      );

      console.log("Notification after update:", notification);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found or access denied",
        });
      }

      return res.json({
        success: true,
        notification,
      });
    } catch (error) {
      console.error("Mark as read error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to mark notification as read",
      });
    }
  },

  markAllAsRead: async (req, res) => {
    try {
      const userModel =
        req.userRole === "owner" ? "OwnerLogin" : "ShelterLogin";

      await Notification.updateMany(
        {
          userId: req.userId,
          userModel: userModel,
          read: false,
        },
        { read: true }
      );

      return res.json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Mark all as read error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to mark all notifications as read",
      });
    }
  },
};

export default notificationController;
