const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    referralCode: {
      type: String,
      required: true,
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },

    reward: {
      type: Number,
      default: 100,
    },

    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Referral", referralSchema);