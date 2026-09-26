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

// GET /api/notifications
router.get("/", authMiddleware, getMyNotifications);

// GET /api/notifications/unread-count
router.get("/unread-count", authMiddleware, getUnreadCount);

// PATCH /api/notifications/:notificationId/read
router.patch(
  "/:notificationId/read",
  authMiddleware,
  markAsRead
);

// PATCH /api/notifications/read-all
router.patch(
  "/read-all",
  authMiddleware,
  markAllAsRead
);

// POST /api/notifications/fcm-token
router.post(
  "/fcm-token",
  authMiddleware,
  saveFcmToken
);

// POST /api/notifications/test
router.post(
  "/test",
  authMiddleware,
  testNotification
);

module.exports = router;