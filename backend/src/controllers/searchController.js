const Business = require("../models/business");
const Profile = require("../models/profile");
const Comment = require("../models/comment");

/**
 * @desc    Search businesses by State, City, Category, and Firm Name
 * @route   GET /api/v1/businesses/search
 * @access  Public
 */
exports.searchBusinesses = async (req, res) => {
  try {
    const { state, city,  category, page = 1, limit = 10 } = req.query;

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

    // const firmNameQuery = prepareRegex(firmName);
    const stateQuery = prepareRegex(state);
    const cityQuery = prepareRegex(city);
    const categoryQuery = prepareRegex(category);

    // 🛑 If no search query is passed
    if (!stateQuery && !cityQuery && !categoryQuery) {
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
 // Dynamic Filter Query
const query = {};

// if (firmNameQuery) {
//   query.firmName = firmNameQuery;
// }

if (categoryQuery) {
  query.category = categoryQuery;
}

if (stateQuery) {
  query.currentState = stateQuery;
}

if (cityQuery) {
  query.currentCity = cityQuery;
}

// Sirf completed aur active profile hi dikhani ho to (optional)
// query.registrationStatus = "completed";
// query.profileUnlocked = true;

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


/**
 * @desc    Search businesses by Firm Name, Owner Name or Phone Number
 * @route   GET /api/v1/businesses/search-by
 * @access  Public
 */
exports.searchBusinessesByField = async (req, res) => {
  try {
    const {
      searchBy,
      searchValue,
      page = 1,
      limit = 10,
    } = req.query;

    // Validate search type
    const allowedFields = {
      firmName: "firmName",
      ownerName: "ownerName",
      phoneNumber: "phoneNumber",
    };

    if (!searchBy || !allowedFields[searchBy]) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid searchBy. Use firmName, ownerName or phoneNumber",
      });
    }

    if (!searchValue || !searchValue.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide searchValue",
      });
    }

    // Escape regex special characters
    const escapedValue = searchValue
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regexQuery = {
      $regex: escapedValue,
      $options: "i",
    };

    // Dynamic field
    const field = allowedFields[searchBy];

    const query = {
      [field]: regexQuery,
    };

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit, 10) || 10)
    );

    const skip = (pageNum - 1) * limitNum;

    console.log(
      "SEARCH BY FIELD QUERY:",
      JSON.stringify(query, null, 2)
    );




const [businesses, totalCount] = await Promise.all([
  Business.find(query)
    .populate("user", "mobile role")
    .select(
      "firmName category name phoneNumber email address currentCity currentState pincode workingAreas profileUnlocked createdAt user"
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean(),

  Business.countDocuments(query),
]);
const businessUserIds = businesses
  .map((business) => business.user?._id)
  .filter(Boolean);

const profiles = await Profile.find({
  user: { $in: businessUserIds },
})
  .select("user name firmName profileImage phoneNumber email")
  .lean();

const profileMap = {};

for (const profile of profiles) {
  profileMap[profile.user.toString()] = profile;
}


const businessIds = businesses.map(
  (business) => business._id
);

const ratingData = await Comment.aggregate([
  {
    $match: {
      transporter: {
        $in: businessIds,
      },
    },
  },
  {
    $group: {
      _id: "$transporter",

      averageRating: {
        $avg: "$rating",
      },

      totalReviews: {
        $sum: 1,
      },
    },
  },
]);

const ratingMap = {};

for (const item of ratingData) {
  ratingMap[item._id.toString()] = {
    averageRating: Number(
      item.averageRating.toFixed(1)
    ),
    totalReviews: item.totalReviews,
  };
}

const formattedBusinesses = businesses.map((business) => {
  const profile = business.user?._id
    ? profileMap[business.user._id.toString()]
    : null;

  const ratings =
    ratingMap[business._id.toString()] || {
      averageRating: 0,
      totalReviews: 0,
    };

  return {
    ...business,

    firmName:
      business.firmName ||
      profile?.firmName ||
      business.name ||
      profile?.name ||
      "Unnamed Business",

    ownerName:
      business.name ||
      profile?.name ||
      "Owner",

    photo:
      profile?.profileImage || "",

    phoneNumber:
      business.phoneNumber ||
      profile?.phoneNumber ||
      business.user?.mobile ||
      "",

    email:
      business.email ||
      profile?.email ||
      "",

    averageRating:
      ratings.averageRating,

    totalReviews:
      ratings.totalReviews,
  };
});


    return res.status(200).json({
      success: true,
      message: "Business search results fetched successfully",
      searchBy,
      searchValue,
      count: businesses.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum) || 0,
      currentPage: pageNum,
      data: formattedBusinesses,
    });
  } catch (error) {
    console.error("Search By Field API Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while searching businesses",
      error: error.message,
    });
  }
};