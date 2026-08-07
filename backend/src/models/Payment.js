const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      default: null,
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
    planSelected: {
      type: String,
      enum: ["3 Month", "6 Months", "1 Year", "Testing Plan", "Free Plan"],
      default: "1 Year",
    },
    status: {
      type: String,
      enum: ["created", "success", "failed", "refunded", "partially_refunded"],
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
    referralCode: {
      type: String,
      default: null,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    settlementStatus: {
  type: String,
  enum: ["pending", "settled", "failed"],
  default: "pending",
},

settledAt: {
  type: Date,
  default: null,
},

refundRequestedAt: {
  type: Date,
  default: null,
},

refundProcessedAt: {
  type: Date,
  default: null,
},
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Refund Fields
    refundId: {
      type: String,
      default: null,
    },
    refundStatus: {
      type: String,
      enum: ["requested","pending", "processed", "failed", null],
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);