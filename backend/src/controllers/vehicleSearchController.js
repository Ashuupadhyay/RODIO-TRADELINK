// const Vehicle = require("../models/vehicle");
// const Business = require("../models/business");

// /**
//  * @desc    Search Vehicles by Origin (From), Destination (To) & Vehicle Type
//  * @route   GET /api/v1/vehicles/search
//  * @access  Public
//  */
// exports.searchVehicles = async (req, res) => {
//   try {
//     const { from, to, vehicleType, page = 1, limit = 10 } = req.query;

//     const pageNum = parseInt(page, 10) || 1;
//     const limitNum = parseInt(limit, 10) || 10;
//     const skip = (pageNum - 1) * limitNum;

//     // 1. Initial Vehicle Match Filter
//     const vehicleMatch = { status: "available" };

//     if (vehicleType && vehicleType !== "All Vehicles") {
//       vehicleMatch.vehicleType = new RegExp(`^${vehicleType.trim()}$`, "i");
//     }

//     // 2. Build Aggregation Pipeline
//     const pipeline = [
//       { $match: vehicleMatch },

//       // Join with MongoDB 'businesses' collection
//       {
//         $lookup: {
//           from: "businesses", // Exact collection name from MongoDB Compass
//           localField: "business",
//           foreignField: "_id",
//           as: "businessDetails",
//         },
//       },

//       // Unwind array to single object
//       { $unwind: "$businessDetails" },
//     ];

//     // 3. Working Area (From & To Location Search)
//     if (from || to) {
//       const locationConditions = [];

//       if (from) {
//         locationConditions.push({
//           $or: [
//             // Pehle check workingAreas me
//             {
//               "businessDetails.workingAreas": {
//                 $elemMatch: {
//                   $or: [
//                     { state: new RegExp(from.trim(), "i") },
//                     { cities: { $in: [new RegExp(from.trim(), "i")] } },
//                   ],
//                 },
//               },
//             },
//             // Fallback: Direct from / currentCity / currentState check
//             { "businessDetails.from": new RegExp(from.trim(), "i") },
//             { "businessDetails.currentCity": new RegExp(from.trim(), "i") },
//             { "businessDetails.currentState": new RegExp(from.trim(), "i") },
//           ],
//         });
//       }

//       if (to) {
//         locationConditions.push({
//           $or: [
//             // Pehle check workingAreas me
//             {
//               "businessDetails.workingAreas": {
//                 $elemMatch: {
//                   $or: [
//                     { state: new RegExp(to.trim(), "i") },
//                     { cities: { $in: [new RegExp(to.trim(), "i")] } },
//                   ],
//                 },
//               },
//             },
//             // Fallback: Direct to check
//             { "businessDetails.to": new RegExp(to.trim(), "i") },
//           ],
//         });
//       }

//       pipeline.push({ $match: { $and: locationConditions } });
//     }

//     // 4. Facet Pagination & Project Output
//     pipeline.push({
//       $facet: {
//         data: [
//           { $sort: { createdAt: -1 } },
//           { $skip: skip },
//           { $limit: limitNum },
//           {
//             $project: {
//               _id: 1,
//               vehicleType: 1,
//               vehicleNumber: 1,
//               capacity: 1,
//               bodyType: 1,
//               status: 1,
//               createdAt: 1,
//               business: {
//                 _id: "$businessDetails._id",
//                 firmName: "$businessDetails.firmName",
//                 ownerName: "$businessDetails.ownerName",
//                 category: "$businessDetails.category",
//                 phoneNumber: "$businessDetails.phoneNumber",
//                 email: "$businessDetails.email",
//                 currentCity: "$businessDetails.currentCity",
//                 currentState: "$businessDetails.currentState",
//                 from: "$businessDetails.from",
//                 to: "$businessDetails.to",
//                 workingAreas: "$businessDetails.workingAreas",
//                 averageRating: "$businessDetails.averageRating",
//                 totalReviews: "$businessDetails.totalReviews",
//               },
//             },
//           },
//         ],
//         totalCount: [{ $count: "count" }],
//       },
//     });

//     // Execute Pipeline
//     const result = await Vehicle.aggregate(pipeline);

//     const vehicles = result[0]?.data || [];
//     const totalCount = result[0]?.totalCount[0]?.count || 0;

//     return res.status(200).json({
//       success: true,
//       message: "Vehicles fetched successfully",
//       count: vehicles.length,
//       totalCount,
//       totalPages: Math.ceil(totalCount / limitNum),
//       currentPage: pageNum,
//       data: vehicles,
//     });
//   } catch (error) {
//     console.error("Vehicle Search Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while searching vehicles",
//       error: error.message,
//     });
//   }
// };




const Vehicle = require("../models/vehicle");
const Business = require("../models/business");
const DirectoryLead = require("../models/directoryLead");

/**
 * @desc    Search Vehicles & Businesses by Origin (From), Destination (To) & Vehicle Type
 * @route   GET /api/v1/vehicles/search
 * @access  Public
 */
exports.searchVehicles = async (req, res) => {
  try {
    const { from, to, vehicleType, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Helper: Regex generator for strict case-insensitive match
    const makeRegex = (val) => new RegExp(val.trim(), "i");

    // --------------------------------------------------
    // STEP 1: Build Location Filter (From & To Strategy)
    // --------------------------------------------------
    const locationConditions = [];

    // FROM: Strictly Origin (currentCity / currentState)
    if (from) {
      const fromRegex = makeRegex(from);
      locationConditions.push({
        $or: [
          { currentCity: fromRegex },
          { currentState: fromRegex }
        ],
      });
    }

    // TO: Working Areas (States + Cities)
    if (to) {
      const toRegex = makeRegex(to);
      locationConditions.push({
        $or: [
          {
            workingAreas: {
              $elemMatch: {
                $or: [
                  { state: toRegex },
                  { cities: { $in: [toRegex] } }
                ],
              },
            },
          }
        ],
      });
    }

    const businessLocationMatch = locationConditions.length > 0 
      ? { $and: locationConditions } 
      : {};

    // --------------------------------------------------
    // STEP 2: Main Search (Vehicle + Business Match)
    // --------------------------------------------------
    const vehicleMatch = { status: "available" };
    if (vehicleType && vehicleType !== "All Vehicles") {
      vehicleMatch.vehicleType = makeRegex(vehicleType);
    }

    const primaryPipeline = [
      { $match: vehicleMatch },
      {
        $lookup: {
          from: "businesses",
          localField: "business",
          foreignField: "_id",
          as: "businessDetails",
        },
      },
      { $unwind: "$businessDetails" },
      // Apply strict From & To filter on populated Business
      ...(Object.keys(businessLocationMatch).length > 0
        ? [{
            $match: Object.keys(businessLocationMatch).reduce((acc, key) => {
              // Convert fields to businessDetails context
              if (key === "$and") {
                acc["$and"] = businessLocationMatch["$and"].map((cond) => {
                  const updatedCond = {};
                  for (let prop in cond) {
                    if (prop === "$or") {
                      updatedCond["$or"] = cond["$or"].map((orItem) => {
                        const newOr = {};
                        for (let innerProp in orItem) {
                          newOr[`businessDetails.${innerProp}`] = orItem[innerProp];
                        }
                        return newOr;
                      });
                    } else {
                      updatedCond[`businessDetails.${prop}`] = cond[prop];
                    }
                  }
                  return updatedCond;
                });
              }
              return acc;
            }, {})
          }]
        : []),
      {
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
                  category: "$businessDetails.category",
                  phoneNumber: "$businessDetails.phoneNumber",
                  email: "$businessDetails.email",
                  currentCity: "$businessDetails.currentCity",
                  currentState: "$businessDetails.currentState",
                  workingAreas: "$businessDetails.workingAreas",
                },
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    let result = await Vehicle.aggregate(primaryPipeline);
    let vehicles = result[0]?.data || [];
    let totalCount = result[0]?.totalCount[0]?.count || 0;
    // ==================================================
// REAL BUSINESS - GET ALL VEHICLES OF MATCHED BUSINESS
// ONE BUSINESS = ONE CARD
// ==================================================

const matchedBusinessIds = [
  ...new Set(
    vehicles
      .map((item) => item.business?._id)
      .filter(Boolean)
      .map((id) => String(id))
  ),
];

if (matchedBusinessIds.length > 0) {

  const allBusinessVehicles = await Vehicle.find({
    business: {
      $in: matchedBusinessIds,
    },
    status: "available",
  })
    .sort({ createdAt: -1 })
    .lean();

  const vehicleMap = new Map();

  for (const vehicle of allBusinessVehicles) {

    const businessId = String(vehicle.business);

    if (!vehicleMap.has(businessId)) {
      vehicleMap.set(businessId, []);
    }

    vehicleMap.get(businessId).push({
      _id: vehicle._id,
      vehicleType: vehicle.vehicleType || "",
      vehicleNumber: vehicle.vehicleNumber || "",
      capacity: vehicle.capacity || "",
      bodyType: vehicle.bodyType || "",
      status: vehicle.status || "available",
    });
  }

  // Attach ALL vehicles to matched business
  for (const item of vehicles) {

    const businessId = String(item.business?._id);

    item.business.vehicles =
      vehicleMap
      .get(businessId) || [];
  }
  // ==================================================
// GROUP REAL VEHICLES
// ONE BUSINESS = ONE CARD
// ==================================================

const groupedRealBusinesses = new Map();

for (const item of vehicles) {

  const businessId = String(item.business?._id);

  if (!businessId) continue;

  if (!groupedRealBusinesses.has(businessId)) {

    groupedRealBusinesses.set(businessId, {
      _id: businessId,

      isDummy: false,
      isFallbackBusiness: false,

      business: {
        ...item.business,

        vehicles: item.business.vehicles || [],
      },
    });
  }
}

// Replace vehicle-level results with business-level results
vehicles = Array.from(groupedRealBusinesses.values());

// Now total count means total businesses/cards
totalCount = vehicles.length;
}
// ==================================================
// DUMMY DIRECTORY VEHICLE SEARCH
// ==================================================

const dummyQuery = {
  status: "dummy",
  isActive: true,
};

const dummyLeads = await DirectoryLead.find(dummyQuery).lean();

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const fromValue = normalize(from);
const toValue = normalize(to);
const vehicleValue = normalize(vehicleType);

const dummyVehicleResults = [];

for (const lead of dummyLeads) {

  // -----------------------------------------
  // FROM = Dummy current city / current state
  // -----------------------------------------

  if (fromValue) {
    const dummyCity = normalize(lead.city);
    const dummyState = normalize(lead.state);

    if (
      dummyCity !== fromValue &&
      dummyState !== fromValue
    ) {
      continue;
    }
  }

  // -----------------------------------------
  // TO = Dummy working areas
  // -----------------------------------------

  if (toValue) {

    let toMatched = false;

    for (const area of lead.workingAreas || []) {

      const areaState = normalize(area.state);

      if (areaState === toValue) {
        toMatched = true;
        break;
      }

      for (const city of area.cities || []) {

        if (normalize(city) === toValue) {
          toMatched = true;
          break;
        }
      }

      if (toMatched) break;
    }

    if (!toMatched) {
      continue;
    }
  }

  // -----------------------------------------
  // VEHICLE MATCH
  // -----------------------------------------

  const matchingVehicles = (lead.vehicles || []).filter((vehicle) => {

    // unavailable vehicle ko ignore karo
    if (vehicle.available === false) {
      return false;
    }

    // All Vehicles selected
    if (
      !vehicleType ||
      vehicleType === "All Vehicles"
    ) {
      return true;
    }

    return (
      normalize(vehicle.vehicleType) === vehicleValue
    );
  });

  // -----------------------------------------
  // Matching vehicle mil gaya
  // -----------------------------------------
// -----------------------------------------
// ONE DUMMY BUSINESS = ONE CARD
// -----------------------------------------

if (matchingVehicles.length > 0) {

  // Is business ke saare available vehicles
  const allDummyVehicles = (lead.vehicles || []).filter(
    (vehicle) => vehicle.available !== false
  );

  dummyVehicleResults.push({

    // ONE ID FOR ONE BUSINESS
    _id: String(lead._id),

    isDummy: true,

    business: {

      _id: lead._id,

      firmName: lead.firmName || "",
      ownerName: lead.ownerName || "",
      category: lead.category || "",

      phoneNumber: lead.mobile || "",
      whatsappNumber: lead.whatsappNumber || "",
      email: lead.email || "",

      currentCity: lead.city || "",
      currentState: lead.state || "",

      workingAreas: lead.workingAreas || [],

      averageRating: lead.averageRating || 0,
      totalReviews: lead.totalReviews || 0,

      address: lead.address || "",
      pincode: lead.pincode || "",

      isVerified: lead.isVerified || false,

      isDummy: true,

      // ALL VEHICLES OF THIS DUMMY BUSINESS
      vehicles: allDummyVehicles.map((vehicle, index) => ({
        _id:
          vehicle._id ||
          `${lead._id}_vehicle_${index}`,

        vehicleType: vehicle.vehicleType || "",
        vehicleNumber: vehicle.vehicleNumber || "",
        capacity: vehicle.capacity || "",
        bodyType: vehicle.bodyType || "",

        status:
          vehicle.available === false
            ? "unavailable"
            : "available",
      })),
    },
  });
}
  // for (const vehicle of matchingVehicles) 
  //   {

  //   dummyVehicleResults.push({

  //     _id: `${lead._id}_${vehicle.vehicleType}`,

  //     vehicleType: vehicle.vehicleType || "",

  //     vehicleNumber: vehicle.vehicleNumber || "",

  //     capacity: vehicle.capacity || "",

  //     bodyType: vehicle.bodyType || "",

  //     status: "available",

  //     createdAt: lead.createdAt,

  //     isDummy: true,

  //     business: {

  //       _id: lead._id,

  //       firmName: lead.firmName || "",

  //       ownerName: lead.ownerName || "",

  //       category: lead.category || "",

  //       phoneNumber: lead.mobile || "",

  //       whatsappNumber: lead.whatsappNumber || "",

  //       email: lead.email || "",

  //       currentCity: lead.city || "",

  //       currentState: lead.state || "",

  //       workingAreas: lead.workingAreas || [],

  //       averageRating: lead.averageRating || 0,

  //       totalReviews: lead.totalReviews || 0,

  //       address: lead.address || "",

  //       pincode: lead.pincode || "",

  //       isVerified: lead.isVerified || false,

  //       isDummy: true,
  //     },
  //   });
  // }
}



    // --------------------------------------------------
    // STEP 3: Fallback Strategy (If no vehicles found)
    // Fetch Businesses matching From & To directly
if (dummyVehicleResults.length > 0) {

  vehicles = [
    ...vehicles,
    ...dummyVehicleResults,
  ];

  totalCount =
    totalCount + dummyVehicleResults.length;
}


    
    // --------------------------------------------------
    let isFallback = false;

    if (vehicles.length === 0 && dummyVehicleResults.length === 0) {
      isFallback = true;
      const fallbackPipeline = [
        { $match: { ...businessLocationMatch, isActive: true } },
        {
          $facet: {
            data: [
              { $sort: { createdAt: -1 } },
              { $skip: skip },
              { $limit: limitNum },
              {
                $project: {
                  _id: 0,
                  isFallbackBusiness: { $literal: true }, // Indicator for frontend
                  business: {
                    _id: "$_id",
                    firmName: "$firmName",
                    category: "$category",
                    phoneNumber: "$phoneNumber",
                    email: "$email",
                    currentCity: "$currentCity",
                    currentState: "$currentState",
                    workingAreas: "$workingAreas",
                  },
                },
              },
            ],
            totalCount: [{ $count: "count" }],
          },
        },
      ];

      const fallbackResult = await Business.aggregate(fallbackPipeline);
      vehicles = fallbackResult[0]?.data || [];
      totalCount = fallbackResult[0]?.totalCount[0]?.count || 0;

      // ==================================================
// DUMMY BUSINESS FALLBACK
// ==================================================

if (isFallback)  {

  const dummyFallbackLeads = await DirectoryLead.find({
    status: "dummy",
    isActive: true,
  }).lean();

  const dummyFallbackResults = [];

  for (const lead of dummyFallbackLeads) {

    // FROM MATCH
    if (fromValue) {

      const dummyCity = normalize(lead.city);
      const dummyState = normalize(lead.state);

      if (
        dummyCity !== fromValue &&
        dummyState !== fromValue
      ) {
        continue;
      }
    }

    // TO MATCH
    if (toValue) {

      let toMatched = false;

      for (const area of lead.workingAreas || []) {

        if (normalize(area.state) === toValue) {
          toMatched = true;
          break;
        }

        if (
          (area.cities || []).some(
            (city) => normalize(city) === toValue
          )
        ) {
          toMatched = true;
          break;
        }
      }

      if (!toMatched) {
        continue;
      }
    }

    dummyFallbackResults.push({
      _id: lead._id,
      isFallbackBusiness: true,
      isDummy: true,

      business: {
        _id: lead._id,

        firmName: lead.firmName || "",
        ownerName: lead.ownerName || "",
        category: lead.category || "",

        phoneNumber: lead.mobile || "",
        whatsappNumber: lead.whatsappNumber || "",

        email: lead.email || "",

        currentCity: lead.city || "",
        currentState: lead.state || "",

        workingAreas: lead.workingAreas || [],

        averageRating: lead.averageRating || 0,
        totalReviews: lead.totalReviews || 0,

        address: lead.address || "",
        pincode: lead.pincode || "",

        isVerified: lead.isVerified || false,

        isDummy: true,
      },
    });
  }

if (dummyFallbackResults.length > 0) {

  vehicles = [
    ...vehicles,
    ...dummyFallbackResults,
  ];

  totalCount =
    totalCount + dummyFallbackResults.length;

  isFallback = true;
}
}
    }

    return res.status(200).json({
      success: true,
      message: isFallback
        ? "No direct vehicle match found. Showing available businesses for route."
        : "Vehicles fetched successfully",
      isFallback,
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