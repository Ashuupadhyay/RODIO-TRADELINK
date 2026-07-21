const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    paymentId: {
      type: String,
      default: null,
    },

    signature: {
      type: String,
      default: null,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["created", "success", "failed"],
      default: "created",
    },

    method: {
      type: String,
      default: null,
    },

    subscriptionStart: {
      type: Date,
      default: null,
    },

    subscriptionEnd: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);