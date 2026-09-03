const HeroSlide = require("../models/HeroSlide");
const { uploadToCloudinary } = require("../config/cloudnary");

// 1. CREATE SLIDE (Uploads straight to Cloudinary)
exports.createSlide = async (req, res) => {
  try {
    const { title, subtitle, order } = req.body;

    if (!req.files || !req.files.desktopImage || !req.files.mobileImage) {
      return res.status(400).json({
        success: false,
        message: "Desktop aur Mobile dono pictures select karna zaroori hai!",
      });
    }

    // Direct Cloudinary Upload
    const [desktopCloudinaryUrl, mobileCloudinaryUrl] = await Promise.all([
      uploadToCloudinary(req.files.desktopImage[0].buffer, "rodio/desktop"),
      uploadToCloudinary(req.files.mobileImage[0].buffer, "rodio/mobile"),
    ]);

    const newSlide = await HeroSlide.create({
      title: title ? title.trim() : "India's Trusted Transport Network",
      subtitle: subtitle ? subtitle.trim() : "",
      desktopImage: desktopCloudinaryUrl,
      mobileImage: mobileCloudinaryUrl,
      order: order ? Number(order) : 0,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Slide Cloudinary par successfully upload ho gayi!",
      data: newSlide,
    });
  } catch (error) {
    console.error("Slide Upload Error:", error);
    return res.status(500).json({
      success: false,
      message: "Cloudinary upload failed",
      error: error.message,
    });
  }
};

// 2. GET ACTIVE SLIDES (For Frontend Website)
exports.getActiveSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: slides,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 3. GET ALL SLIDES (For Admin Panel)
exports.getAllAdminSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1, createdAt: -1 });
    return res.status(200).json({ success: true, data: slides });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 4. TOGGLE SLIDE STATUS
exports.toggleSlideStatus = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) return res.status(404).json({ success: false, message: "Slide nahi mili" });

    slide.isActive = !slide.isActive;
    await slide.save();
    return res.status(200).json({ success: true, data: slide });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 5. DELETE SLIDE
exports.deleteSlide = async (req, res) => {
  try {
    await HeroSlide.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Slide deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};