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
//       page = 1,
//       limit = 12,
//     } = req.query;

//     // ---------------------------------------
//     // Business Filter
//     // ---------------------------------------

//     // const businessFilter = {
//     //   registrationStatus: "completed",
//     //   subscriptionStatus: "active",
//     //   profileUnlocked: true,
//     //   isActive: true,
//     // };
// const businessFilter = {
//   isActive: true,
// };

// if (state && state !== "Pending") {
//   businessFilter.currentState = new RegExp(state, "i");
// }

// if (city && city !== "Pending") {
//   businessFilter.currentCity = new RegExp(city, "i");
// }

// if (search) {
//   businessFilter.$or = [
//     { firmName: new RegExp(search, "i") },
//     { name: new RegExp(search, "i") },
//   ];
// }
//     if (state) {
//       businessFilter.currentState = new RegExp(state, "i");
//     }

//     if (city) {
//       businessFilter.currentCity = new RegExp(city, "i");
//     }

//     if (search) {
//       businessFilter.firmName = new RegExp(search, "i");
//     }

//     // ---------------------------------------
//     // Get Businesses (LIFO Order: Latest created first)
//     // ---------------------------------------

//     let businesses = await Business.find(businessFilter)
//       .populate("user", "role")
//       .sort({ createdAt: -1 })
//       .lean();

//     // ---------------------------------------
//     // Role Filter
//     // ---------------------------------------

//     if (role) {
//       businesses = businesses.filter(
//         (item) =>
//           item.user &&
//           item.user.role.toLowerCase() === role.toLowerCase()
//       );
//     }

//     // ---------------------------------------
//     // Vehicle Type Filter & Mapping
//     // ---------------------------------------

//     const result = [];

//     for (const business of businesses) {
//       const vehicles = await Vehicle.find({
//         business: business._id,
//         status: { $ne: "inactive" },
//       })
//         .select("vehicleType")
//         .lean();

//       const vehicleTypes = [
//         ...new Set(vehicles.map((v) => v.vehicleType)),
//       ];

//       if (
//         vehicleType &&
//         !vehicleTypes.some(
//           (v) =>
//             v.toLowerCase() === vehicleType.toLowerCase()
//         )
//       ) {
//         continue;
//       }

//       result.push({
//         _id: business._id,

//         firmName: business.firmName,

//         role: business.user?.role || "",

//         phoneNumber: business.phoneNumber,

//         email: business.email,

//         city: business.currentCity,

//         state: business.currentState,

//         workingAreas: business.workingAreas,

//         vehicleTypes,

//         totalVehicles: vehicles.length,

//         createdAt: business.createdAt,
//       });
//     }

//     // ---------------------------------------
//     // Separate Vandana Motors & Put On Top
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

//     // Combine: Featured Card sabse upar, baaki LIFO order me
//     const finalData = [...featuredCard, ...otherCards];

//     // ---------------------------------------
//     // Pagination
//     // ---------------------------------------

//     const start = (page - 1) * limit;
//     const end = start + Number(limit);

//     const paginated = finalData.slice(start, end);

//     return res.status(200).json({
//       success: true,

//       total: finalData.length,

//       currentPage: Number(page),

//       totalPages: Math.ceil(
//         finalData.length / Number(limit)
//       ),

//       data: paginated,
//     });
//   } catch (error) {
//     console.log(error);

//     return res.status(500).json({
//       success: false,
//       message: "Directory fetch failed",
//     });
//   }
// };


const Business = require("../models/business");
const User = require("../models/register");
const Vehicle = require("../models/vehicle");

// ======================================================
// DIRECTORY LIST
// GET /api/directory
// ======================================================

exports.getDirectory = async (req, res) => {
  try {
    const {
      role,
      state,
      city,
      vehicleType,
      search,
      page = 1,
      limit = 12,
    } = req.query;

    // ---------------------------------------
    // 1. Build Query Filters
    // ---------------------------------------
    const businessFilter = {
      isActive: true,
    };

    if (state && state !== "Pending") {
      businessFilter.currentState = new RegExp(state, "i");
    }

    if (city && city !== "Pending") {
      businessFilter.currentCity = new RegExp(city, "i");
    }

    if (search) {
      businessFilter.$or = [
        { firmName: new RegExp(search, "i") },
        { name: new RegExp(search, "i") },
      ];
    }

    // ---------------------------------------
    // 2. Fetch Businesses & Populate User Role
    // ---------------------------------------
    let businesses = await Business.find(businessFilter)
      .populate("user", "role")
      .sort({ createdAt: -1 })
      .lean();

    // ---------------------------------------
    // 3. Filter by User Role (if specified)
    // ---------------------------------------
    if (role) {
      businesses = businesses.filter(
        (item) =>
          item.user &&
          item.user.role &&
          item.user.role.toLowerCase() === role.toLowerCase()
      );
    }

    // ---------------------------------------
    // 4. Single Query Vehicle Matching (N+1 Issue Fix)
    // ---------------------------------------
    const businessIds = businesses.map((b) => b._id);
    const allVehicles = await Vehicle.find({
      business: { $in: businessIds },
      status: { $ne: "inactive" },
    })
      .select("business vehicleType")
      .lean();

    // Group vehicles by Business ID
    const vehicleMap = {};
    for (const v of allVehicles) {
      const bId = v.business.toString();
      if (!vehicleMap[bId]) {
        vehicleMap[bId] = [];
      }
      vehicleMap[bId].push(v.vehicleType);
    }

    // ---------------------------------------
    // 5. Map & Apply Vehicle Filter
    // ---------------------------------------
    const result = [];

    for (const business of businesses) {
      const bId = business._id.toString();
      const rawVehicles = vehicleMap[bId] || [];
      const vehicleTypes = [...new Set(rawVehicles)];

      // Filter by vehicleType query if provided
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
        firmName: business.firmName,
        role: business.user?.role || "",
        phoneNumber: business.phoneNumber,
        email: business.email,
        city: business.currentCity,
        state: business.currentState,
        workingAreas: business.workingAreas || [],
        vehicleTypes,
        totalVehicles: rawVehicles.length,
        createdAt: business.createdAt,
      });
    }

    // ---------------------------------------
    // 6. Separate Featured Card (Vandana Motors) & Pin To Top
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

    // ---------------------------------------
    // 7. Pagination
    // ---------------------------------------
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginatedData = finalData.slice(start, end);

    return res.status(200).json({
      success: true,
      total: finalData.length,
      currentPage: Number(page),
      totalPages: Math.ceil(finalData.length / Number(limit)),
      data: paginatedData,
    });
  } catch (error) {
    console.error("DIRECTORY FETCH ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Directory fetch failed",
    });
  }
};