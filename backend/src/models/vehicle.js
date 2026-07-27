const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    vehicleType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    capacity: {
      type: String,
      trim: true,
    },

    bodyType: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["available", "busy", "inactive"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

vehicleSchema.index(
  {
    business: 1,
    vehicleNumber: 1,
  },
  {
    unique: true,
  }
);

module.exports =
  mongoose.models.Vehicle ||
  mongoose.model("Vehicle", vehicleSchema);