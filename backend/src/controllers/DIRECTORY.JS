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

    // Filter state only if valid value is sent
    if (state && state !== "Pending" && state !== "All") {
      businessFilter.currentState = new RegExp(state, "i");
    }

    // Filter city only if valid value is sent
    if (city && city !== "Pending" && city !== "All") {
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
    // 3. Normalized Role Filtering
    // ---------------------------------------
    if (role && role !== "all") {
      const targetRole = role.toLowerCase().replace(/[\s_-]+/g, "");

      businesses = businesses.filter((item) => {
        if (!item.user || !item.user.role) return false;
        const userRole = item.user.role.toLowerCase().replace(/[\s_-]+/g, "");
        return userRole === targetRole;
      });
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
        firmName: business.firmName || "Unnamed Business",
        role: business.user?.role || business.category || "",
        phoneNumber: business.phoneNumber,
        email: business.email || "",
        city: business.currentCity || "Not Specified",
        state: business.currentState || "Not Specified",
        workingAreas: business.workingAreas || [],
        vehicleTypes,
        totalVehicles: rawVehicles.length,
        createdAt: business.createdAt,
      });
    }

    // ---------------------------------------
    // 6. Featured Card (Vandana Motors) Pin To Top
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