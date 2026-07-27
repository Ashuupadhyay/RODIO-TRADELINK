const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    // ==========================================
    // OWNER
    // ==========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one business per user
      index: true,
    },

    // ==========================================
    // BASIC BUSINESS DETAILS
    // ==========================================

    firmName: {
      type: String,
      required: true,
      trim: true,
    },

    // Registered User se automatically aayega
    phoneNumber: {
      type: String,
      trim: true,
    },
    email: {
  type: String,
  trim: true,
  lowercase: true,
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

    // ==========================================
    // REGISTRATION STATUS
    // ==========================================

    registrationStatus: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
      index: true,
    },

    // ==========================================
    // SUBSCRIPTION
    // ==========================================

    subscriptionStatus: {
      type: String,
      enum: [
        "pending",
        "active",
        "expired",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    // Payment successful hone ke baad true
    profileUnlocked: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // WORKING AREAS
    // Payment ke baad user add kar sakta hai
    // ==========================================

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

    // ==========================================
    // ACTIVE STATUS
    // ==========================================

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
  mongoose.model(
    "Business",
    businessSchema
  );