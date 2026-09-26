const Notification = require("../models/Notification");
const User = require("../models/register");

// =====================================================
// GET MY NOTIFICATIONS
// GET /api/notifications
// =====================================================
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({
      recipient: userId,
    })
      .sort({createdAt: -1})
      .limit(100)
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get notifications",
    });
  }
};

// =====================================================
// GET UNREAD COUNT
// GET /api/notifications/unread-count
// =====================================================
const getUnreadCount = async (req, res) => {
  try {
   const userId = req.user.id;

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Unread Count Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get unread count",
    });
  }
};

// =====================================================
// MARK ONE NOTIFICATION AS READ
// PATCH /api/notifications/:notificationId/read
// =====================================================
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const {notificationId} = req.params;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: userId,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Mark Read Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/notifications/read-all
// =====================================================
const markAllAsRead = async (req, res) => {
  try {
  const userId = req.user.id;

    await Notification.updateMany(
      {
        recipient: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark All Read Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
    });
  }
};

// =====================================================
// SAVE FCM TOKEN
// POST /api/notifications/fcm-token
// =====================================================
const saveFcmToken = async (req, res) => {
  try {
  const userId = req.user.id;
    const {token} = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "FCM token is required",
      });
    }

    await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          fcmTokens: token,
        },
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "FCM token saved successfully",
    });
  } catch (error) {
    console.error("Save FCM Token Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save FCM token",
    });
  }
};
const testNotification = async (req, res) => {
  try {
    console.log("TEST req.user:", req.user);

    const userId = req.user?.id || req.user?._id;

    console.log("TEST userId:", userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in authentication",
        user: req.user,
      });
    }

    const {createNotification} = require("../services/notificationService");

    const notification = await createNotification({
      recipient: userId,
      sender: userId,
      title: "Rodio Test Notification",
      message: "FCM notification successfully working!",
      type: "SYSTEM",
      entityType: "SYSTEM",
    });

    return res.status(200).json({
      success: true,
      message: "Test notification sent",
      notification,
    });
  } catch (error) {
    console.error("Test Notification Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send test notification",
      error: error.message,
    });
  }
};
// =====================================================
// EXPORTS
// =====================================================
module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  saveFcmToken,
    testNotification,
};