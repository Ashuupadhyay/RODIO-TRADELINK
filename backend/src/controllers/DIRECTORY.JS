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
//     console.error("DIRECTORY FETCH ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Directory fetch failed",
//     });
//   }
// };





const Business = require("../models/business");
const Vehicle = require("../models/vehicle");

/**
 * @desc    Get Directory Data with multi-filter search (State, City, Category/Role)
 * @route   GET /api/directory
 * @access  Public
 */
exports.getDirectory = async (req, res) => {
  try {
    const { state, city, category, role, search, vehicleType } = req.query;

    // Helper for Regex (Space-insensitive & Case-insensitive)
    const prepareRegex = (text) => {
      if (!text || typeof text !== "string") return null;
      const cleaned = text.replace(/\u00A0/g, " ").trim();
      if (!cleaned || cleaned === "All" || cleaned === "Pending") return null;
      const escaped = cleaned.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regexPattern = escaped.replace(/ +/g, "[\\s\\xc2\\xa0]+");
      return new RegExp(regexPattern, "i");
    };

    const stateRegex = prepareRegex(state);
    const cityRegex = prepareRegex(city);
    const categoryQuery = category || role; // standardizing category/role input
    const categoryRegex = prepareRegex(categoryQuery);
    const searchRegex = prepareRegex(search);

    // ---------------------------------------
    // 1. Dynamic MongoDB Filter Query
    // ---------------------------------------
    const businessFilter = {
      isActive: true,
    };

    if (stateRegex) {
      businessFilter.currentState = stateRegex;
    }

    if (cityRegex) {
      businessFilter.currentCity = cityRegex;
    }

    if (categoryRegex) {
      // Check both 'category' in Business and 'role' inside User model
      businessFilter.$or = [
        { category: categoryRegex },
        { role: categoryRegex }
      ];
    }

    if (searchRegex) {
      const searchConditions = [
        { firmName: searchRegex },
        { name: searchRegex }
      ];
      if (businessFilter.$or) {
        businessFilter.$and = [
          { $or: businessFilter.$or },
          { $or: searchConditions }
        ];
        delete businessFilter.$or;
      } else {
        businessFilter.$or = searchConditions;
      }
    }

    // ---------------------------------------
    // 2. Fetch Businesses & Populate User Data
    // ---------------------------------------
    let businesses = await Business.find(businessFilter)
      .populate("user", "mobile role")
      .sort({ averageRating: -1, totalReviews: -1, createdAt: -1 })
      .lean();

    // ---------------------------------------
    // 3. Fetch Matching Vehicles
    // ---------------------------------------
    const businessIds = businesses.map((b) => b._id);
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
      if (!vehicleMap[bId]) {
        vehicleMap[bId] = [];
      }
      vehicleMap[bId].push(v.vehicleType);
    }

    // ---------------------------------------
    // 4. Map Full Data Structure
    // ---------------------------------------
    const result = [];

    for (const business of businesses) {
      const bId = business._id.toString();
      const rawVehicles = vehicleMap[bId] || [];
      const vehicleTypes = [...new Set(rawVehicles)];

      // Filter by vehicleType if requested
      if (
        vehicleType &&
        !vehicleTypes.some(
          (v) => v.toLowerCase() === vehicleType.toLowerCase()
        )
      ) {
        continue;
      }

      result.push({
        _id: business._id,
        firmName: business.firmName || "Unnamed Business",
        role: business.user?.role || business.category || "Transporter",
        phoneNumber: business.phoneNumber || business.user?.mobile || "",
        email: business.email || "",
        city: business.currentCity || "Not Specified",
        state: business.currentState || "Not Specified",
        workingAreas: business.workingAreas || [],
        averageRating: business.averageRating || 0,
        totalReviews: business.totalReviews || 0,
        vehicleTypes,
        totalVehicles: rawVehicles.length,
        createdAt: business.createdAt,
      });
    }

    // ---------------------------------------
    // 5. Featured Card (Vandana Motors) Pin To Top
    // ---------------------------------------
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