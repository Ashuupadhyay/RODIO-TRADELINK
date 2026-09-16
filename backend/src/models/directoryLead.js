const mongoose = require("mongoose");

const directoryLeadSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    firmName: {
      type: String,
      default: "",
      trim: true,
    },

    ownerName: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      default: "transporter",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    whatsappNumber: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    pincode: {
      type: String,
      default: "",
      trim: true,
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

    businessDescription: {
      type: String,
      default: "",
      trim: true,
    },

    officeWorkingHours: {
      start: {
        type: String,
        default: "",
      },

      end: {
        type: String,
        default: "",
      },
    },

    officeWorkingDays: [
      {
        type: String,
        trim: true,
      },
    ],

    vehicles: [
      {
        vehicleType: {
          type: String,
          default: "",
        },

        vehicleNumber: {
          type: String,
          default: "",
        },

        capacity: {
          type: String,
          default: "",
        },

        bodyType: {
          type: String,
          default: "",
        },

        available: {
          type: Boolean,
          default: true,
        },
      },
    ],

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    gallery: [
      {
        type: String,
        trim: true,
      },
    ],

    // =====================================
    // REGISTRATION TRACKING
    // =====================================

    status: {
      type: String,
      enum: ["dummy", "registered", "deleted"],
      default: "dummy",
      index: true,
    },

    registeredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    registeredAt: {
      type: Date,
      default: null,
    },

    // =====================================
    // PUBLIC DIRECTORY STATUS
    // =====================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.DirectoryLead ||
  mongoose.model("DirectoryLead", directoryLeadSchema);