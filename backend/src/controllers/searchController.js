const Business = require("../models/business");

/**
 * @desc    Search businesses by State, City, Category, and Firm Name
 * @route   GET /api/v1/businesses/search
 * @access  Public
 */
exports.searchBusinesses = async (req, res) => {
  try {
    const { state, city, firmName, category, page = 1, limit = 10 } = req.query;

    // Helper function to clean text (removes non-breaking spaces and extra spaces)
    const cleanText = (text) => {
      if (!text) return "";
      return text.replace(/\u00A0/g, " ").trim();
    };

    const cleanedFirmName = cleanText(firmName);
    const cleanedState = cleanText(state);
    const cleanedCity = cleanText(city);
    const cleanedCategory = cleanText(category);

    // 🛑 RULE: Agar user ne na toh FirmName diya hai, AUR na hi (State/City/Category) mein se kuch diya hai, 
    // toh default mein koi data nahi aana chahiye!
    if (!cleanedFirmName && !cleanedState && !cleanedCity && !cleanedCategory) {
      return res.status(200).json({
        success: true,
        message: "Please provide search criteria (State/City/Category or Firm Name)",
        count: 0,
        totalCount: 0,
        totalPages: 0,
        currentPage: parseInt(page, 10) || 1,
        data: [],
      });
    }

    const query = {};

    // 1. Firm Name Filter
    if (cleanedFirmName) {
      query.firmName = {
        $regex: cleanedFirmName,
        $options: "i",
      };
    }

    // 2. Category / Role Filter
    if (cleanedCategory) {
      query.category = {
        $regex: cleanedCategory,
        $options: "i",
      };
    }

    // 3. Current State Filter
    if (cleanedState) {
      query.currentState = {
        $regex: cleanedState,
        $options: "i",
      };
    }

    // 4. Current City Filter
    if (cleanedCity) {
      query.currentCity = {
        $regex: cleanedCity,
        $options: "i",
      };
    }

    // Pagination Setup
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    console.log("FINAL MONGODB QUERY:", JSON.stringify(query, null, 2));

    // Search Query Execution
    const [businesses, totalCount] = await Promise.all([
      Business.find(query)
        .populate("user", "mobile role")
        .select(
          "firmName category phoneNumber email address currentCity currentState pincode workingAreas averageRating totalReviews profileUnlocked createdAt"
        )
        .sort({ averageRating: -1, totalReviews: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Business.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Search results fetched successfully",
      count: businesses.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      data: businesses,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while searching businesses",
      error: error.message,
    });
  }
};