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
    // Business Filter
    // ---------------------------------------

    const businessFilter = {
      registrationStatus: "completed",
      subscriptionStatus: "active",
      profileUnlocked: true,
      isActive: true,
    };

    if (state) {
      businessFilter.currentState = new RegExp(state, "i");
    }

    if (city) {
      businessFilter.currentCity = new RegExp(city, "i");
    }

    if (search) {
      businessFilter.firmName = new RegExp(search, "i");
    }

    // ---------------------------------------
    // Get Businesses
    // ---------------------------------------

    let businesses = await Business.find(businessFilter)
      .populate("user", "role")
      .sort({ createdAt: -1 })
      .lean();

    // ---------------------------------------
    // Role Filter
    // ---------------------------------------

    if (role) {
      businesses = businesses.filter(
        (item) =>
          item.user &&
          item.user.role.toLowerCase() === role.toLowerCase()
      );
    }

    // ---------------------------------------
    // Vehicle Type Filter
    // ---------------------------------------

    const result = [];

    for (const business of businesses) {
      const vehicles = await Vehicle.find({
        business: business._id,
        status: { $ne: "inactive" },
      })
        .select("vehicleType")
        .lean();

      const vehicleTypes = [
        ...new Set(vehicles.map((v) => v.vehicleType)),
      ];

      if (
        vehicleType &&
        !vehicleTypes.some(
          (v) =>
            v.toLowerCase() === vehicleType.toLowerCase()
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

        workingAreas: business.workingAreas,

        vehicleTypes,

        totalVehicles: vehicles.length,
      });
    }

    // ---------------------------------------
    // Pin "Vandana Motors" to Top
    // ---------------------------------------
    result.sort((a, b) => {
      const isAFeatured = 
        (a.firmName && a.firmName.toLowerCase() === "vandana motors") || 
        a.phoneNumber === "8319501708";

      const isBFeatured = 
        (b.firmName && b.firmName.toLowerCase() === "vandana motors") || 
        b.phoneNumber === "8319501708";

      if (isAFeatured && !isBFeatured) return -1;
      if (!isAFeatured && isBFeatured) return 1;
      return 0;
    });

    // ---------------------------------------
    // Pagination
    // ---------------------------------------

    const start = (page - 1) * limit;
    const end = start + Number(limit);

    const paginated = result.slice(start, end);

    return res.status(200).json({
      success: true,

      total: result.length,

      currentPage: Number(page),

      totalPages: Math.ceil(
        result.length / Number(limit)
      ),

      data: paginated,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Directory fetch failed",
    });
  }
};