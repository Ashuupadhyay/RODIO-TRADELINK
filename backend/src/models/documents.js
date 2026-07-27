const mongoose = require("mongoose");

const businessDocumentSchema = new mongoose.Schema(
  {
    // Kis business ka document hai
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    // Kis user ne upload kiya
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    documentType: {
      type: String,
      required: true,
      enum: [
        "aadhaar",
        "pan",
        "gst",
        "gumasta",
        "rc",
        "insurance",
        "permit",
        "other",
      ],
    },

    documentName: {
      type: String,
      trim: true,
    },

    // Cloudinary URL
    documentUrl: {
      type: String,
      required: true,
    },

    // Cloudinary public id
    publicId: {
      type: String,
      default: "",
    },

    verificationStatus: {
      type: String,
      enum: [
        "pending",
        "verified",
        "rejected",
      ],
      default: "pending",
    },

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
  mongoose.models.BusinessDocument ||
  mongoose.model(
    "BusinessDocument",
    businessDocumentSchema
  );