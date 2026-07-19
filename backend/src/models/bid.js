const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema(
  {
    // Kis lead par bid lagi
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    // Kis transporter ne bid lagayi
    transporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Bid amount
    amount: {
      type: Number,
      required: true,
    },

    // Optional message
    message: {
      type: String,
      default: "",
    },

    // Bid Status
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bid", bidSchema);