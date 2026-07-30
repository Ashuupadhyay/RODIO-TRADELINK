const Vehicle = require("../models/vehicle");
const Business = require("../models/business");

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

    // 1. Initial Vehicle Match Filter
    const vehicleMatch = { status: "available" };

    if (vehicleType && vehicleType !== "All Vehicles") {
      vehicleMatch.vehicleType = new RegExp(`^${vehicleType.trim()}$`, "i");
    }

    // 2. Build Aggregation Pipeline
    const pipeline = [
      { $match: vehicleMatch },

      // Join with MongoDB 'businesses' collection
      {
        $lookup: {
          from: "businesses", // Exact collection name from MongoDB Compass
          localField: "business",
          foreignField: "_id",
          as: "businessDetails",
        },
      },

      // Unwind array to single object
      { $unwind: "$businessDetails" },
    ];

    // 3. Working Area (From & To Location Search)
    if (from || to) {
      const locationConditions = [];

      if (from) {
        locationConditions.push({
          $or: [
            // Pehle check workingAreas me
            {
              "businessDetails.workingAreas": {
                $elemMatch: {
                  $or: [
                    { state: new RegExp(from.trim(), "i") },
                    { cities: { $in: [new RegExp(from.trim(), "i")] } },
                  ],
                },
              },
            },
            // Fallback: Direct from / currentCity / currentState check
            { "businessDetails.from": new RegExp(from.trim(), "i") },
            { "businessDetails.currentCity": new RegExp(from.trim(), "i") },
            { "businessDetails.currentState": new RegExp(from.trim(), "i") },
          ],
        });
      }

      if (to) {
        locationConditions.push({
          $or: [
            // Pehle check workingAreas me
            {
              "businessDetails.workingAreas": {
                $elemMatch: {
                  $or: [
                    { state: new RegExp(to.trim(), "i") },
                    { cities: { $in: [new RegExp(to.trim(), "i")] } },
                  ],
                },
              },
            },
            // Fallback: Direct to check
            { "businessDetails.to": new RegExp(to.trim(), "i") },
          ],
        });
      }

      pipeline.push({ $match: { $and: locationConditions } });
    }

    // 4. Facet Pagination & Project Output
    pipeline.push({
      $facet: {
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limitNum },
          {
            $project: {
              _id: 1,
              vehicleType: 1,
              vehicleNumber: 1,
              capacity: 1,
              bodyType: 1,
              status: 1,
              createdAt: 1,
              business: {
                _id: "$businessDetails._id",
                firmName: "$businessDetails.firmName",
                ownerName: "$businessDetails.ownerName",
                category: "$businessDetails.category",
                phoneNumber: "$businessDetails.phoneNumber",
                email: "$businessDetails.email",
                currentCity: "$businessDetails.currentCity",
                currentState: "$businessDetails.currentState",
                from: "$businessDetails.from",
                to: "$businessDetails.to",
                workingAreas: "$businessDetails.workingAreas",
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
    console.error("Vehicle Search Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while searching vehicles",
      error: error.message,
    });
  }
};