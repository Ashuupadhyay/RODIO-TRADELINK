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
      enum: ["user", "broker", "transporter","fleet_owner",
        "cha_agent",
        "courier",
        "bus_service",
        "travel_taxi",
        "truck_body_builder",
        "rto_agent",
        "finance_company",
        "finance_agent",
        "packers_movers",
        "insurance_company",
        "car_carrier",
        "miningvehicle_supplier",
        "partstypesbettry_supplier",
        "mechanic and service center",
        "biketexiauto",
        "candfagent"],
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
      type: String,
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