const HeroSlide = require("../models/HeroSlide");

// ==========================================
// 1. GET ACTIVE SLIDES (Public - For Frontend)
// ==========================================
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
    console.error("Get Active Slides Error:", error);
    return res.status(500).json({
      success: false,
      message: "Slides fetch karne mein dikkat aayi",
      error: error.message,
    });
  }
};

// ==========================================
// 2. GET ALL SLIDES (Admin Control Panel)
// ==========================================
exports.getAllAdminSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: slides,
    });
  } catch (error) {
    console.error("Get Admin Slides Error:", error);
    return res.status(500).json({
      success: false,
      message: "Slides load nahi ho payi",
      error: error.message,
    });
  }
};

// ==========================================
// 3. ADD NEW SLIDE (Admin Control Panel)
// ==========================================
exports.createSlide = async (req, res) => {
  try {
    const { title, subtitle, desktopImage, mobileImage, order, isActive } = req.body;

    if (!title || !desktopImage || !mobileImage) {
      return res.status(400).json({
        success: false,
        message: "Title, Desktop Image URL aur Mobile Image URL zaroori hain.",
      });
    }

    const slide = await HeroSlide.create({
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : "",
      desktopImage: desktopImage.trim(),
      mobileImage: mobileImage.trim(),
      order: order ? Number(order) : 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({
      success: true,
      message: "Slide successfully add ho gayi!",
      data: slide,
    });
  } catch (error) {
    console.error("Create Slide Error:", error);
    return res.status(500).json({
      success: false,
      message: "Slide add karne mein dikkat aayi",
      error: error.message,
    });
  }
};

// ==========================================
// 4. UPDATE SLIDE STATUS (Enable / Disable)
// ==========================================
exports.toggleSlideStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const slide = await HeroSlide.findById(id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: "Slide nahi mili",
      });
    }

    slide.isActive = !slide.isActive;
    await slide.save();

    return res.status(200).json({
      success: true,
      message: `Slide ab ${slide.isActive ? "Active" : "Inactive"} hai`,
      data: slide,
    });
  } catch (error) {
    console.error("Toggle Slide Error:", error);
    return res.status(500).json({
      success: false,
      message: "Status update nahi ho paya",
      error: error.message,
    });
  }
};

// ==========================================
// 5. DELETE SLIDE (Admin Control Panel)
// ==========================================
exports.deleteSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const slide = await HeroSlide.findByIdAndDelete(id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: "Slide nahi mili",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Slide successfully delete ho gayi!",
    });
  } catch (error) {
    console.error("Delete Slide Error:", error);
    return res.status(500).json({
      success: false,
      message: "Slide delete nahi ho payi",
      error: error.message,
    });
  }
};