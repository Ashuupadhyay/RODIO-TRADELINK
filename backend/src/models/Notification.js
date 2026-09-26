const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "NEW_LOAD",

        "NEW_BID",
        "BID_ACCEPTED",
        "BID_REJECTED",

        "BOOKING_CREATED",
        "BOOKING_ACCEPTED",
        "BOOKING_REJECTED",
        "BOOKING_CANCELLED",
        "BOOKING_COMPLETED",

        "SUBSCRIPTION_7_DAYS",
        "SUBSCRIPTION_3_DAYS",
        "SUBSCRIPTION_1_DAY",
        "SUBSCRIPTION_EXPIRED",

        "ADMIN",
        "SYSTEM",
        "CUSTOM",
      ],
      required: true,
      index: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    entityType: {
      type: String,
      enum: [
        "LOAD",
        "BID",
        "BOOKING",
        "SUBSCRIPTION",
        "USER",
        "SYSTEM",
        null,
      ],
      default: null,
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    isPushSent: {
      type: Boolean,
      default: false,
    },

    pushSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);