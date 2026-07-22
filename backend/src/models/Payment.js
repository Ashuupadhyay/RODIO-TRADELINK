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
    referralCode: {
  type: String,
  default: null,
},

referredBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},
receiptNumber: {
  type: String,
  unique: true,
  sparse: true,
},
refundId: {
  type: String,
  default: null,
},

refundStatus: {
  type: String,
  default: null,
},

refundAmount: {
  type: Number,
  default: 0,
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);