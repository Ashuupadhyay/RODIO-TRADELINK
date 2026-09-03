const mongoose = require("mongoose");

const heroSlideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "India's Trusted Transport Network",
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    desktopImage: {
      type: String,
      required: true, // Cloudinary URL
    },
    mobileImage: {
      type: String,
      required: true, // Cloudinary URL
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HeroSlide", heroSlideSchema);