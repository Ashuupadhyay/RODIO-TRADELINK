const Business = require("../models/business");

/**
 * @desc    Search businesses by State, City, Category, and Firm Name
 * @route   GET /api/v1/businesses/search
 * @access  Public
 */
exports.searchBusinesses = async (req, res) => {
  try {
    const { state, city, firmName, category, page = 1, limit = 10 } = req.query;

    // Helper to clean input & build MongoDB compatible space-insensitive regex
    const prepareRegex = (text) => {
      if (!text || typeof text !== "string") return null;

      // 1. Remove extra/non-breaking spaces from incoming parameter
      const cleaned = text.replace(/\u00A0/g, " ").trim();
      if (!cleaned) return null;

      // 2. Escape special regex characters like ( ) [ ] + * ? etc.
      const escaped = cleaned.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      // 3. Replace spaces with [\s\xc2\xa0]+ (MongoDB PCRE2 safe for NBSP)
      const regexPattern = escaped.replace(/ +/g, "[\\s\\xc2\\xa0]+");

      return { $regex: regexPattern, $options: "i" };
    };

    const firmNameQuery = prepareRegex(firmName);
    const stateQuery = prepareRegex(state);
    const cityQuery = prepareRegex(city);
    const categoryQuery = prepareRegex(category);

    // 🛑 If no search query is passed
    if (!firmNameQuery && !stateQuery && !cityQuery && !categoryQuery) {
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

    // Dynamic Filter Query
    const query = {};
    if (firmNameQuery) query.firmName = firmNameQuery;
    if (categoryQuery) query.category = categoryQuery;
    if (stateQuery) query.currentState = stateQuery;
    if (cityQuery) query.currentCity = cityQuery;

    // Pagination Parameters
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    console.log("EXECUTING MONGODB QUERY:", JSON.stringify(query, null, 2));

    // Parallel DB Executions
    const [businesses, totalCount] = await Promise.all([
      Business.find(query)
        .populate("user", "mobile role")
        .select(
          "firmName category phoneNumber email address currentCity currentState pincode workingAreas averageRating totalReviews profileUnlocked createdAt"
        )
        .sort({ averageRating: -1, totalReviews: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Business.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Search results fetched successfully",
      count: businesses.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum) || 0,
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