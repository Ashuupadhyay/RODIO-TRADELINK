const Notification = require("../models/Notification");
const User = require("../models/register");
const firebaseApp = require("../config/firebaseAdmin");
const { getMessaging } = require("firebase-admin/messaging");

const createNotification = async ({
  recipient,
  sender = null,
  title,
  message,
  type,
  entityId = null,
  entityType = null,
  data = {},
}) => {
  try {
    if (!recipient) {
      throw new Error("Notification recipient is required");
    }

    // 1. Save notification in MongoDB
    const notification = await Notification.create({
      recipient,
      sender,
      title,
      message,
      type,
      entityId,
      entityType,
      data,
    });

    // 2. Get user's FCM tokens
    const user = await User.findById(recipient).select("fcmTokens");

    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      console.log("No FCM token found for user:", recipient);

      return notification;
    }

    // 3. Send push notification
const response = await getMessaging(firebaseApp).sendEachForMulticast({
      tokens: user.fcmTokens,

      notification: {
        title,
        body: message,
      },

      data: {
        notificationId: notification._id.toString(),
        type: type || "SYSTEM",
        entityId: entityId ? entityId.toString() : "",
        entityType: entityType || "",
        ...Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            key,
            String(value),
          ])
        ),
      },

      android: {
        priority: "high",
        notification: {
          sound: "default",
        },
      },
    });

    console.log(
      `FCM sent: ${response.successCount} success, ${response.failureCount} failed`
    );

    // 4. Update push status
    if (response.successCount > 0) {
      await Notification.findByIdAndUpdate(notification._id, {
        isPushSent: true,
        pushSentAt: new Date(),
      });
    }

    return notification;
  } catch (error) {
    console.error("Create Notification Error:", error);

    throw error;
  }
};

module.exports = {
  createNotification,
};