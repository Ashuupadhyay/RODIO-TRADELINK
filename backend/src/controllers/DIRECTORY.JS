// const Business = require("../models/business");
// const User = require("../models/register");
// const Vehicle = require("../models/vehicle");

// // ======================================================
// // DIRECTORY LIST
// // GET /api/directory
// // ======================================================

// exports.getDirectory = async (req, res) => {
//   try {
//     const {
//       role,
//       state,
//       city,
//       vehicleType,
//       search,
      
//     } = req.query;

//     // ---------------------------------------
//     // 1. Build Query Filters
//     // ---------------------------------------
//     const businessFilter = {
//       isActive: true,
//     };

//     // Filter state only if valid value is sent
//     if (state && state !== "Pending" && state !== "All") {
//       businessFilter.currentState = new RegExp(state, "i");
//     }

//     // Filter city only if valid value is sent
//     if (city && city !== "Pending" && city !== "All") {
//       businessFilter.currentCity = new RegExp(city, "i");
//     }

//     if (search) {
//       businessFilter.$or = [
//         { firmName: new RegExp(search, "i") },
//         { name: new RegExp(search, "i") },
//       ];
//     }

//     // ---------------------------------------
//     // 2. Fetch Businesses & Populate User Role
//     // ---------------------------------------
//     let businesses = await Business.find(businessFilter)
//       .populate("user", "role")
//       .sort({ createdAt: -1 })
//       .lean();

//     // ---------------------------------------
//     // 3. Normalized Role Filtering
//     // ---------------------------------------
//     if (role && role !== "all") {
//       const targetRole = role.toLowerCase().replace(/[\s_-]+/g, "");

//       businesses = businesses.filter((item) => {
//         if (!item.user || !item.user.role) return false;
//         const userRole = item.user.role.toLowerCase().replace(/[\s_-]+/g, "");
//         return userRole === targetRole;
//       });
//     }

//     // ---------------------------------------
//     // 4. Single Query Vehicle Matching (N+1 Issue Fix)
//     // ---------------------------------------
//     const businessIds = businesses.map((b) => b._id);
//     const allVehicles = await Vehicle.find({
//       business: { $in: businessIds },
//       status: { $ne: "inactive" },
//     })
//       .select("business vehicleType")
//       .lean();

//     // Group vehicles by Business ID
//     const vehicleMap = {};
//     for (const v of allVehicles) {
//       const bId = v.business.toString();
//       if (!vehicleMap[bId]) {
//         vehicleMap[bId] = [];
//       }
//       vehicleMap[bId].push(v.vehicleType);
//     }

//     // ---------------------------------------
//     // 5. Map & Apply Vehicle Filter
//     // ---------------------------------------
//     const result = [];

//     for (const business of businesses) {
//       const bId = business._id.toString();
//       const rawVehicles = vehicleMap[bId] || [];
//       const vehicleTypes = [...new Set(rawVehicles)];

//       // Filter by vehicleType query if provided
//       if (
//         vehicleType &&
//         !vehicleTypes.some(
//           (v) => v.toLowerCase() === vehicleType.toLowerCase()
//         )
//       ) {
//         continue;
//       }

//       result.push({
//         _id: business._id,
//         firmName: business.firmName || "Unnamed Business",
//         role: business.user?.role || business.category || "",
//         phoneNumber: business.phoneNumber,
//         email: business.email || "",
//         city: business.currentCity || "Not Specified",
//         state: business.currentState || "Not Specified",
//         workingAreas: business.workingAreas || [],
//         vehicleTypes,
//         totalVehicles: rawVehicles.length,
//         createdAt: business.createdAt,
//       });
//     }

//     // ---------------------------------------
//     // 6. Featured Card (Vandana Motors) Pin To Top
//     // ---------------------------------------
//     const featuredCard = [];
//     const otherCards = [];

//     const targetPhone = "8319501708";
//     const targetName = "vandana motors";

//     for (const item of result) {
//       const name = String(item.firmName || "").toLowerCase().trim();
//       const phone = String(item.phoneNumber || "").trim();

//       if (phone === targetPhone || name === targetName) {
//         featuredCard.push(item);
//       } else {
//         otherCards.push(item);
//       }
//     }

//     const finalData = [...featuredCard, ...otherCards];

//     // ---------------------------------------
//     // 7. Pagination
//     // ---------------------------------------
//     return res.status(200).json({
//   success: true,
//   total: finalData.length,
//   data: finalData,
// });
//   } catch (error) {
// //     console.error("DIRECTORY FETCH ERROR:", error);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Directory fetch failed",
// //     });
// //   }
// // };





// const Business = require("../models/business");
// const Vehicle = require("../models/vehicle");

// /**
//  * @desc    Get Directory Data with multi-filter search (State, City, Category/Role)
//  * @route   GET /api/directory
//  * @access  Public
//  */
// exports.getDirectory = async (req, res) => {
//   try {
//     const { state, city, category, role, search, vehicleType } = req.query;

//     // Helper for Regex (Space-insensitive & Case-insensitive)
//     const prepareRegex = (text) => {
//       if (!text || typeof text !== "string") return null;
//       const cleaned = text.replace(/\u00A0/g, " ").trim();
//       if (!cleaned || cleaned === "All" || cleaned === "Pending") return null;
//       const escaped = cleaned.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//       const regexPattern = escaped.replace(/ +/g, "[\\s\\xc2\\xa0]+");
//       return new RegExp(regexPattern, "i");
//     };

//     const stateRegex = prepareRegex(state);
//     const cityRegex = prepareRegex(city);
//     const categoryQuery = category || role; // standardizing category/role input
//     const categoryRegex = prepareRegex(categoryQuery);
//     const searchRegex = prepareRegex(search);

//     // ---------------------------------------
//     // 1. Dynamic MongoDB Filter Query
//     // ---------------------------------------
//     const businessFilter = {
//       isActive: true,
//     };

//     if (stateRegex) {
//       businessFilter.currentState = stateRegex;
//     }

//     if (cityRegex) {
//       businessFilter.currentCity = cityRegex;
//     }

//     if (categoryRegex) {
//       // Check both 'category' in Business and 'role' inside User model
//       businessFilter.$or = [
//         { category: categoryRegex },
//         { role: categoryRegex }
//       ];
//     }

//     if (searchRegex) {
//       const searchConditions = [
//         { firmName: searchRegex },
//         { name: searchRegex }
//       ];
//       if (businessFilter.$or) {
//         businessFilter.$and = [
//           { $or: businessFilter.$or },
//           { $or: searchConditions }
//         ];
//         delete businessFilter.$or;
//       } else {
//         businessFilter.$or = searchConditions;
//       }
//     }

//     // ---------------------------------------
//     // 2. Fetch Businesses & Populate User Data
//     // ---------------------------------------
//     let businesses = await Business.find(businessFilter)
//       .populate("user", "mobile role")
//       .sort({ averageRating: -1, totalReviews: -1, createdAt: -1 })
//       .lean();

//     // ---------------------------------------
//     // 3. Fetch Matching Vehicles
//     // ---------------------------------------
//     const businessIds = businesses.map((b) => b._id);
//     const allVehicles = await Vehicle.find({
//       business: { $in: businessIds },
//       status: { $ne: "inactive" },
//     })
//       .select("business vehicleType")
//       .lean();

//     const vehicleMap = {};
//     for (const v of allVehicles) {
//       if (!v.business) continue;
//       const bId = v.business.toString();
//       if (!vehicleMap[bId]) {
//         vehicleMap[bId] = [];
//       }
//       vehicleMap[bId].push(v.vehicleType);
//     }

//     // ---------------------------------------
//     // 4. Map Full Data Structure
//     // ---------------------------------------
//     const result = [];

//     for (const business of businesses) {
//       const bId = business._id.toString();
//       const rawVehicles = vehicleMap[bId] || [];
//       const vehicleTypes = [...new Set(rawVehicles)];

//       // Filter by vehicleType if requested
//       if (
//         vehicleType &&
//         !vehicleTypes.some(
//           (v) => v.toLowerCase() === vehicleType.toLowerCase()
//         )
//       ) {
//         continue;
//       }

//       result.push({
//         _id: business._id,
//         firmName: business.firmName || "Unnamed Business",
//         role: business.user?.role || business.category || "Transporter",
//         phoneNumber: business.phoneNumber || business.user?.mobile || "",
//         email: business.email || "",
//         city: business.currentCity || "Not Specified",
//         state: business.currentState || "Not Specified",
//         workingAreas: business.workingAreas || [],
//         averageRating: business.averageRating || 0,
//         totalReviews: business.totalReviews || 0,
//         vehicleTypes,
//         totalVehicles: rawVehicles.length,
//         createdAt: business.createdAt,
//       });
//     }

//     // ---------------------------------------
//     // 5. Featured Card (Vandana Motors) Pin To Top
//     // ---------------------------------------
//     const featuredCard = [];
//     const otherCards = [];

//     const targetPhone = "8319501708";
//     const targetName = "vandana motors";

//     for (const item of result) {
//       const name = String(item.firmName || "").toLowerCase().trim();
//       const phone = String(item.phoneNumber || "").trim();

//       if (phone === targetPhone || name === targetName) {
//         featuredCard.push(item);
//       } else {
//         otherCards.push(item);
//       }
//     }

//     const finalData = [...featuredCard, ...otherCards];

//     return res.status(200).json({
//       success: true,
//       count: finalData.length,
//       data: finalData,
//     });
//   } catch (error) {
//     console.error("DIRECTORY SEARCH FETCH ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Directory fetch failed",
//       error: error.message,
//     });
//   }
// };



const Business = require("../models/business");
const Vehicle = require("../models/vehicle");
const Profile = require("../models/profile");
const Comment = require("../models/comments");
const DirectoryLead = require("../models/directoryLead");
/**
 * @desc    Get Directory Data with Universal Category, State, and City Matching
 * @route   GET /api/directory
 * @access  Public
 */
exports.getDirectory = async (req, res) => {
  try {
    const { state, city, category, role, search, vehicleType } = req.query;

    // Helper: Input Sanitizer
    const cleanInput = (text) => {
      if (!text || typeof text !== "string") return "";
      return text.replace(/\u00A0/g, " ").trim().toLowerCase();
    };

    const rawState = cleanInput(state);
    const rawCity = cleanInput(city);
    const rawCategory = cleanInput(category || role);
    const rawSearch = cleanInput(search);

    // -------------------------------------------------------------
    // Universal Matcher: Works for ALL Categories, States & Cities
    // -------------------------------------------------------------
    // const createUniversalMatcher = (inputStr) => {
    //   if (!inputStr || inputStr === "all" || inputStr === "pending") return null;

    //   const alphaNumericOnly = inputStr.replace(/[^a-z0-9]/gi, "");
    //   if (!alphaNumericOnly) return null;

    //   // 1. Matches spaces, underscores, hyphens dynamically
    //   const flexPattern = alphaNumericOnly.split("").join("[\\s\\-_]*");
    //   const flexRegex = new RegExp(flexPattern, "i");

    //   // 2. Prefix Matcher for Typos (first 3-4 chars)
    //   const prefixLength = Math.min(alphaNumericOnly.length, 3);
    //   const prefixPattern = alphaNumericOnly.substring(0, prefixLength);
    //   const prefixRegex = new RegExp("^" + prefixPattern, "i");

    //   return {
    //     flexRegex,
    //     prefixRegex,
    //     rawText: alphaNumericOnly,
    //   };
    // };
    const createUniversalMatcher = (inputStr) => {
  if (
    !inputStr ||
    inputStr === "all" ||
    inputStr === "pending"
  ) {
    return null;
  }

  return inputStr
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
};

    const stateMatcher = createUniversalMatcher(rawState);
    const cityMatcher = createUniversalMatcher(rawCity);
    const categoryMatcher = createUniversalMatcher(rawCategory);
    const searchMatcher = createUniversalMatcher(rawSearch);

    // Fetch all active businesses once
let allBusinesses = await Business.find({
  isActive: true,
 
})
      .populate("user", "mobile role")
      .sort({ averageRating: -1, totalReviews: -1, createdAt: -1 })
      .lean();

      // dummy cards 
      // -------------------------------------------------------------
// Fetch active dummy directory leads
// -------------------------------------------------------------
const dummyLeads = await DirectoryLead.find({
  status: "dummy",
  isActive: true,
}).lean();
      const businessUserIds = allBusinesses
  .map((b) => b.user?._id)
  .filter(Boolean);

const profiles = await Profile.find({
  user: { $in: businessUserIds },
})
  .select("user name firmName profileImage")
  .lean();

const profileMap = {};

for (const profile of profiles) {
  profileMap[profile.user.toString()] = profile;
}
// -------------------------------------------------------------
// Calculate Ratings From Comments
// -------------------------------------------------------------
const businessIdsForRating = allBusinesses.map(
  (business) => business._id
);

const ratingData = await Comment.aggregate([
  {
    $match: {
      transporter: {
        $in: businessIdsForRating,
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
    averageRating: Number(item.averageRating.toFixed(1)),
    totalReviews: item.totalReviews,
  };
}
    // -------------------------------------------------------------
    // Filtering & Scoring Engine (Handles All Categories & Locations)
    // -------------------------------------------------------------
    const scoredBusinesses = allBusinesses.map((b) => {
      let score = 0;

      const busState = cleanInput(b.currentState);
      const busCity = cleanInput(b.currentCity);
      const busCategory = cleanInput(b.category);
      const busUserRole = cleanInput(b.user?.role);
      const busName = cleanInput(b.firmName || b.name);
const profile = b.user?._id
  ? profileMap[b.user._id.toString()]
  : null;
      // --- State Filtering ---

// --- EXACT STATE FILTER ---
if (stateMatcher) {
  if (
    cleanInput(b.currentState)
      .replace(/[\s_-]+/g, "") !== stateMatcher
  ) {
    return null;
  }
}

// --- EXACT CITY FILTER ---
if (cityMatcher) {
  if (
    cleanInput(b.currentCity)
      .replace(/[\s_-]+/g, "") !== cityMatcher
  ) {
    return null;
  }
}

// --- EXACT CATEGORY / ROLE FILTER ---
if (categoryMatcher) {
  const businessCategory = cleanInput(b.category)
    .replace(/[\s_-]+/g, "");

  const userRole = cleanInput(b.user?.role)
    .replace(/[\s_-]+/g, "");

  if (
    businessCategory !== categoryMatcher &&
    userRole !== categoryMatcher
  ) {
    return null;
  }
}






      // if (stateMatcher) {
      //   if (stateMatcher.flexRegex.test(busState)) score += 30;
      //   else if (stateMatcher.prefixRegex.test(busState)) score += 15;
      //   else return null; // Exclude if state doesn't match
      // }

      // // --- City Filtering ---
      // if (cityMatcher) {
      //   if (cityMatcher.flexRegex.test(busCity)) score += 30;
      //   else if (cityMatcher.prefixRegex.test(busCity)) score += 15;
      //   else return null; // Exclude if city doesn't match
      // }

      // // --- Universal Category / Role Check ---
      // if (categoryMatcher) {
      //   const matchesCategoryFlex =
      //     categoryMatcher.flexRegex.test(busCategory) ||
      //     categoryMatcher.flexRegex.test(busUserRole);

      //   const matchesCategoryPrefix =
      //     categoryMatcher.prefixRegex.test(busCategory) ||
      //     categoryMatcher.prefixRegex.test(busUserRole);

      //   if (matchesCategoryFlex) score += 40;
      //   else if (matchesCategoryPrefix) score += 20;
      //   else return null; // Exclude if category doesn't match
      // }

      // --- Firm/Business Search ---
      if (searchMatcher) {
        if (searchMatcher.flexRegex.test(busName)) score += 50;
        else if (searchMatcher.prefixRegex.test(busName)) score += 25;
        else return null;
      }

      return { business: b, score };
    }).filter(Boolean);

  // -------------------------------------------------------------
// Dummy Leads Filtering
// Same State / City / Category / Search logic
// -------------------------------------------------------------
const scoredDummyLeads = dummyLeads.map((lead) => {
  let score = 0;

  const leadState = cleanInput(lead.state);
  const leadCity = cleanInput(lead.city);
  const leadCategory = cleanInput(lead.category);
  // const leadName = cleanInput(lead.firmName || lead.ownerName);
  // const leadPhone = cleanInput(lead.mobile);
const leadFirmName = cleanInput(lead.firmName);
const leadOwnerName = cleanInput(lead.ownerName);
const leadPhone = cleanInput(lead.mobile);
  // State
// ============================================
// EXACT DUMMY STATE FILTER
// ============================================
if (stateMatcher) {
  if (
    cleanInput(lead.state)
      .replace(/[\s_-]+/g, "") !== stateMatcher
  ) {
    return null;
  }
}

// ============================================
// EXACT DUMMY CITY FILTER
// ============================================
if (cityMatcher) {
  if (
    cleanInput(lead.city)
      .replace(/[\s_-]+/g, "") !== cityMatcher
  ) {
    return null;
  }
}

// ============================================
// EXACT DUMMY CATEGORY FILTER
// ============================================
if (categoryMatcher) {
  if (
    cleanInput(lead.category)
      .replace(/[\s_-]+/g, "") !== categoryMatcher
  ) {
    return null;
  }
}

  // if (stateMatcher) {
  //   if (stateMatcher.flexRegex.test(leadState)) score += 30;
  //   else if (stateMatcher.prefixRegex.test(leadState)) score += 15;
  //   else return null;
  // }

  // // City
  // if (cityMatcher) {
  //   if (cityMatcher.flexRegex.test(leadCity)) score += 30;
  //   else if (cityMatcher.prefixRegex.test(leadCity)) score += 15;
  //   else return null;
  // }

  // // Category
  // if (categoryMatcher) {
  //   if (categoryMatcher.flexRegex.test(leadCategory)) {
  //     score += 40;
  //   } else if (categoryMatcher.prefixRegex.test(leadCategory)) {
  //     score += 20;
  //   } else {
  //     return null;
  //   }
  // }

  // Search
  if (searchMatcher) {
  if (
    searchMatcher.flexRegex.test(leadFirmName) ||
    searchMatcher.flexRegex.test(leadOwnerName) ||
    searchMatcher.flexRegex.test(leadPhone)
  ) {
    score += 50;
  } else if (
    searchMatcher.prefixRegex.test(leadFirmName) ||
    searchMatcher.prefixRegex.test(leadOwnerName) ||
    searchMatcher.prefixRegex.test(leadPhone)
  ) {
    score += 25;
  } else {
    return null;
  }
}
  // if (searchMatcher) {
  //   if (
  //     searchMatcher.flexRegex.test(leadName) ||
  //     searchMatcher.flexRegex.test(leadPhone)
  //   ) {
  //     score += 50;
  //   } else if (
  //     searchMatcher.prefixRegex.test(leadName) ||
  //     searchMatcher.prefixRegex.test(leadPhone)
  //   ) {
  //     score += 25;
  //   } else {
  //     return null;
  //   }
  // }

  return {
    lead,
    score,
  };
}).filter(Boolean);

    /// dummy 
    let matchedBusinesses = [];
if (scoredBusinesses.length > 0) {
  matchedBusinesses = scoredBusinesses.map(
    (item) => item.business
  );
}
    // if (scoredBusinesses.length > 0) {
    //   scoredBusinesses.sort((a, b) => b.score - a.score);
    //   matchedBusinesses = scoredBusinesses.map((item) => item.business);
    // } else if (categoryMatcher) {
    //   // Fallback: If location had heavy typos, still show results by Category
    //   matchedBusinesses = allBusinesses.filter((b) => {
    //     const busCat = cleanInput(b.category);
    //     const busRole = cleanInput(b.user?.role);
    //     return (
    //       categoryMatcher.flexRegex.test(busCat) ||
    //       categoryMatcher.flexRegex.test(busRole)
    //     );
    //   });
    // }

    // Default Fallback: Show all active cards if initial load / no matching filters
    // if (matchedBusinesses.length === 0 && !search) {
    //   matchedBusinesses = allBusinesses;
    // }

    // -------------------------------------------------------------
    // Fetch Matching Vehicles
    // -------------------------------------------------------------
    const businessIds = matchedBusinesses.map((b) => b._id);
    const allVehicles = await Vehicle.find({
      business: { $in: businessIds },
      status: { $ne: "inactive" },
    })
      .select("business vehicleType")
      .lean();

    const vehicleMap = {};
    for (const v of allVehicles) {
      if (!v.business) continue;
      const bId = v.business.toString();
      if (!vehicleMap[bId]) vehicleMap[bId] = [];
      vehicleMap[bId].push(v.vehicleType);
    }

    // -------------------------------------------------------------
    // Format Cards Output
    // -------------------------------------------------------------
    const result = [];

    for (const business of matchedBusinesses) {
      const bId = business._id.toString();
      const rawVehicles = vehicleMap[bId] || [];
      const vehicleTypes = [...new Set(rawVehicles)];

      if (
        vehicleType &&
        !vehicleTypes.some(
          (v) => v.toLowerCase() === vehicleType.toLowerCase()
        )
      ) {
        continue;
      }

     const profile = business.user?._id
  ? profileMap[business.user._id.toString()]
  : null;

result.push({
  _id: business._id,

  // Business details
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

  role:
    business.category ||
    business.user?.role ||
    "Transporter",

  phoneNumber:
    business.phoneNumber ||
    profile?.phoneNumber ||
    business.user?.mobile ||
    "",

  email:
    business.email ||
    profile?.email ||
    "",

  // Profile photo
  photo:
    profile?.profileImage ||
    "",

  // Location
  city:
    business.currentCity ||
    "",

  state:
    business.currentState ||
    "",

  workingAreas:
    business.workingAreas || [],

  // Rating
  // Rating
  averageRating:
    ratingMap[bId]?.averageRating || 0,

  totalReviews:
    ratingMap[bId]?.totalReviews || 0,
    // Verification
  isVerified: business.isVerified || false,
  verifiedAt: business.verifiedAt || null,



  // Vehicles
  vehicleTypes,

  totalVehicles:
    rawVehicles.length,

  createdAt:
    business.createdAt,
});
    }

    // dummy
    // -------------------------------------------------------------
// ADD DUMMY LEADS TO RESULT
// -------------------------------------------------------------
for (const item of scoredDummyLeads) {
  const lead = item.lead;

  const vehicleTypes = [
    ...new Set(
      (lead.vehicles || [])
        .map((v) => v.vehicleType)
        .filter(Boolean)
    ),
  ];

  // Vehicle Type Filter
  if (
    vehicleType &&
    !vehicleTypes.some(
      (v) =>
        String(v).toLowerCase() ===
        String(vehicleType).toLowerCase()
    )
  ) {
    continue;
  }

  result.push({
    _id: lead._id,

    firmName:
      lead.firmName ||
      "Unnamed Business",

    ownerName:
      lead.ownerName ||
      "Owner",

    role:
      lead.category ||
      "Transporter",

    phoneNumber:
      lead.mobile ||
      "",

    email:
      lead.email ||
      "",

    photo: "",

    city:
      lead.city ||
      "",

    state:
      lead.state ||
      "",

    workingAreas:
      lead.workingAreas ||
      [],

    averageRating:
      lead.averageRating || 0,

    totalReviews:
      lead.totalReviews || 0,

    
    vehicleTypes,

    totalVehicles:
      (lead.vehicles || []).length,

    createdAt:
      lead.createdAt,
      isVerified: lead.isVerified || false,
verifiedAt: lead.verifiedAt || null,

    // Frontend identification
    isDummy: true,
  });
}
      // -------------------------------------------------------------
    // Pinned Featured Card Logic
    // -------------------------------------------------------------
    const featuredCard = [];
    const otherCards = [];

    const targetPhone = "8319501708";
    const targetName = "vandana motors";

    for (const item of result) {
      const name = String(item.firmName || "").toLowerCase().trim();
      const phone = String(item.phoneNumber || "").trim();

      if (phone === targetPhone || name === targetName) {
        featuredCard.push(item);
      } else {
        otherCards.push(item);
      }
    }

    const finalData = [...featuredCard, ...otherCards];

    return res.status(200).json({
      success: true,
      count: finalData.length,
      data: finalData,
    });
  } catch (error) {
    console.error("DIRECTORY SEARCH FETCH ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Directory fetch failed",
      error: error.message,
    });
  }
};