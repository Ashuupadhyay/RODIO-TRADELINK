const express = require("express");

const router = express.Router();

const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  saveFcmToken,
    testNotification,
} = require("../controllers/notificationController");

const authMiddleware = require("../middlewhere/auth");

// Get notifications
router.get(
  "/",
  authMiddleware,
  getMyNotifications
);

// Get unread count
router.get(
  "/unread-count",
  authMiddleware,
  getUnreadCount
);

// Mark one as read
router.patch(
  "/:notificationId/read",
  authMiddleware,
  markAsRead
);

// Mark all as read
router.patch(
  "/read-all",
  authMiddleware,
  markAllAsRead
);

// Save FCM token
router.post(
  "/fcm-token",
  authMiddleware,
  saveFcmToken
);

// Test notification
router.post(
  "/test",
  authMiddleware,
  testNotification
);

module.exports = router;