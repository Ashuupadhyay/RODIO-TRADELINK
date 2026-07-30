const Vehicle = require("../models/vehicle"); // Path check kar lein
const Business = require("../models/business"); // 1. FIX: Business Model import kar diya hai

/**
 * @desc    Search Vehicles by Origin (From), Destination (To) & Vehicle Type
 * @route   GET /api/v1/vehicles/search
 * @access  Public
 */
exports.searchVehicles = async (req, res) => {
  try {
    const { from, to, vehicleType, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // 1. Initial Match Condition for Available Vehicles
    const vehicleMatch = { status: "available" };
    if (vehicleType && vehicleType !== "All Vehicles") {
      vehicleMatch.vehicleType = new RegExp(`^${vehicleType.trim()}$`, "i");
    }

    // 2. Build Pipeline
    const pipeline = [
      { $match: vehicleMatch },

      // Join with Business Collection
      {
        $lookup: {
          // 2. FIX: MongoDB collection name lowercase + plural hota hai ('businesses')
          from: "businesses", 
          localField: "business",
          foreignField: "_id",
          as: "businessDetails",
        },
      },

      // Convert array result from lookup to an object
      { $unwind: "$businessDetails" },

      // Filter active & completed business profiles
      {
        $match: {
          "businessDetails.isActive": true,
          "businessDetails.profileUnlocked": true,
          "businessDetails.registrationStatus": "completed",
        },
      },
    ];

    // 3. FROM & TO Location Filtering on Working Area
    if (from || to) {
      const locationConditions = [];

      if (from) {
        locationConditions.push({
          "businessDetails.workingAreas": {
            $elemMatch: {
              $or: [
                { state: new RegExp(from.trim(), "i") },
                { cities: { $in: [new RegExp(from.trim(), "i")] } },
              ],
            },
          },
        });
      }

      if (to) {
        locationConditions.push({
          "businessDetails.workingAreas": {
            $elemMatch: {
              $or: [
                { state: new RegExp(to.trim(), "i") },
                { cities: { $in: [new RegExp(to.trim(), "i")] } },
              ],
            },
          },
        });
      }

      pipeline.push({ $match: { $and: locationConditions } });
    }

    // 4. Facet for Data Pagination & Total Count in single database hit
    pipeline.push({
      $facet: {
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limitNum },
          {
            $project: {
              vehicleType: 1,
              vehicleNumber: 1,
              capacity: 1,
              bodyType: 1,
              status: 1,
              createdAt: 1,
              business: {
                _id: "$businessDetails._id",
                firmName: "$businessDetails.firmName",
                category: "$businessDetails.category",
                phoneNumber: "$businessDetails.phoneNumber",
                email: "$businessDetails.email",
                currentCity: "$businessDetails.currentCity",
                currentState: "$businessDetails.currentState",
                averageRating: "$businessDetails.averageRating",
                totalReviews: "$businessDetails.totalReviews",
              },
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    });

    // Execute Pipeline
    const result = await Vehicle.aggregate(pipeline);

    const vehicles = result[0]?.data || [];
    const totalCount = result[0]?.totalCount[0]?.count || 0;

    return res.status(200).json({
      success: true,
      message: "Vehicles fetched successfully",
      count: vehicles.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      data: vehicles,
    });
  } catch (error) {
    console.error("Vehicle Search Aggregation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while searching vehicles",
      error: error.message,
    });
  }
};