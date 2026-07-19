const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // Lead kisne create ki
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Creator ka role
    creatorRole: {
      type: String,
      enum: ["user", "broker", "transporter"],
      required: true,
    },

    // Lead select hone ke baad transporter
    selectedTransporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Lead Status
    status: {
      type: String,
      enum: [
        "Open",
        "Assigned",
        "In Progress",
        "Completed",
        "Cancelled",
      ],
      default: "Open",
    },

    // Booking Details
    service: {
      type: String,
      required: true,
    },

    vehicleType: {
      type: String,
      required: true,
    },

    pickupLocation: {
      type: String,
      required: true,
    },

    loading_point: {
      type: String,
      required: true,
    },

    pickupDate: {
      type: String,
      required: true,
    },

    goodsType: {
      type: String,
    },

    weight: {
      type: Number,
    },

    contactPerson: {
      type: String,
      required: true,
    },

    contactNumber: {
      type: String,
      required: true,
    },

    expectedBudget: {
      type: Number,
    },

    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);