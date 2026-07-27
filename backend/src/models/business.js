const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    firmName: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    currentCity: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    currentState: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    subscriptionStatus: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled"],
      default: "pending",
      index: true,
    },

    profileUnlocked: {
      type: Boolean,
      default: false,
    },

    workingAreas: [
      {
        state: {
          type: String,
          trim: true,
        },

        cities: [
          {
            type: String,
            trim: true,
          },
        ],
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Business ||
  mongoose.model("Business", businessSchema);