// const Vehicle = require("../models/vehicle");

// // CREATE
// exports.createVehicle = async (req, res) => {
//   try {
//     const {
//       vehicleType,
//       vehicleNumber,
//       capacity,
//       bodyType,
//     } = req.body;

//     if (!vehicleType || !vehicleNumber) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Vehicle type and vehicle number are required",
//       });
//     }

//     const vehicle = await Vehicle.create({
//       business: req.business._id,
//       vehicleType,
//       vehicleNumber,
//       capacity,
//       bodyType,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Vehicle added successfully",
//       data: vehicle,
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(409).json({
//         success: false,
//         message: "Vehicle already exists",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// // GET MY VEHICLES
// exports.getMyVehicles = async (req, res) => {
//   try {
//     const vehicles = await Vehicle.find({
//       business: req.business._id,
//     }).sort({
//       createdAt: -1,
//     });

//     return res.status(200).json({
//       success: true,
//       data: vehicles,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// // UPDATE
// exports.updateVehicle = async (req, res) => {
//   try {
//     const vehicle = await Vehicle.findOneAndUpdate(
//       {
//         _id: req.params.id,
//         business: req.business._id,
//       },
//       {
//         $set: req.body,
//       },
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     if (!vehicle) {
//       return res.status(404).json({
//         success: false,
//         message: "Vehicle not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Vehicle updated",
//       data: vehicle,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// // DELETE
// exports.deleteVehicle = async (req, res) => {
//   try {
//     const vehicle = await Vehicle.findOneAndDelete({
//       _id: req.params.id,
//       business: req.business._id,
//     });

//     if (!vehicle) {
//       return res.status(404).json({
//         success: false,
//         message: "Vehicle not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Vehicle deleted",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// exports.getMyWorkingAreas = async (req, res) => {
//   try {
//     const business = await Business.findOne({ user: req.user.id }).select(
//       "workingAreas"
//     );

//     if (!business) {
//       return res.status(404).json({
//         success: false,
//         message: "Business profile not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Working areas fetched successfully",
//       data: business.workingAreas,
//     });
//   } catch (err) {
//     console.error("Get Working Areas Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

// // 3. DELETE SPECIFIC WORKING AREA BY STATE OR ITEM ID
// exports.deleteWorkingArea = async (req, res) => {
//   try {
//     const { areaId, state } = req.body;

//     if (!areaId && !state) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide either areaId or state to delete",
//       });
//     }

//     // Direct ObjectId se remove karega agar areaId passing ho, warna state name se
//     const pullCondition = areaId ? { _id: areaId } : { state: state };

//     const business = await Business.findOneAndUpdate(
//       { user: req.user.id },
//       { $pull: { workingAreas: pullCondition } },
//       { new: true }
//     );

//     if (!business) {
//       return res.status(404).json({
//         success: false,
//         message: "Business profile not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Working area removed successfully",
//       data: business.workingAreas,
//     });
//   } catch (err) {
//     console.error("Delete Working Area Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };


const Vehicle = require("../models/vehicle");
const Business = require("../models/business"); // 👈 FIX 1: Missing Import Added

// ==========================================
// VEHICLE CONTROLLERS
// ==========================================

// 1. CREATE VEHICLE
exports.createVehicle = async (req, res) => {
  try {
    const { vehicleType, vehicleNumber, capacity, bodyType } = req.body;

    if (!vehicleType || !vehicleNumber) {
      return res.status(400).json({
        success: false,
        message: "Vehicle type and vehicle number are required",
      });
    }

    // Business ID handle karein (Middleware context se)
    let businessId = req.business ? req.business._id : null;
    
    if (!businessId) {
      const business = await Business.findOne({ user: req.user.id });
      if (!business) {
        return res.status(400).json({
          success: false,
          message: "Business profile not found. Please complete profile registration first.",
        });
      }
      businessId = business._id;
    }

    const vehicle = await Vehicle.create({
      business: businessId,
      vehicleType,
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      capacity,
      bodyType,
    });

    return res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      data: vehicle,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Vehicle number already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Server error while adding vehicle",
    });
  }
};

// 2. GET MY VEHICLES
exports.getMyVehicles = async (req, res) => {
  try {
    let businessId = req.business ? req.business._id : null;

    if (!businessId) {
      const business = await Business.findOne({ user: req.user.id });
      if (!business) {
        return res.status(200).json({
          success: true,
          data: [],
        });
      }
      businessId = business._id;
    }

    const vehicles = await Vehicle.find({ business: businessId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching vehicles",
    });
  }
};

// 3. UPDATE VEHICLE
exports.updateVehicle = async (req, res) => {
  try {
    const { vehicleType, vehicleNumber, capacity, bodyType, status } = req.body;

    let businessId = req.business ? req.business._id : null;
    if (!businessId) {
      const business = await Business.findOne({ user: req.user.id });
      if (!business) {
        return res.status(404).json({ success: false, message: "Business not found" });
      }
      businessId = business._id;
    }

    // Explicit fields update for security
    const updateData = {};
    if (vehicleType) updateData.vehicleType = vehicleType;
    if (vehicleNumber) updateData.vehicleNumber = vehicleNumber.trim().toUpperCase();
    if (capacity !== undefined) updateData.capacity = capacity;
    if (bodyType !== undefined) updateData.bodyType = bodyType;
    if (status) updateData.status = status;

    const vehicle = await Vehicle.findOneAndUpdate(
      {
        _id: req.params.id,
        business: businessId,
      },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while updating vehicle",
    });
  }
};

// 4. DELETE VEHICLE
exports.deleteVehicle = async (req, res) => {
  try {
    let businessId = req.business ? req.business._id : null;
    if (!businessId) {
      const business = await Business.findOne({ user: req.user.id });
      if (!business) {
        return res.status(404).json({ success: false, message: "Business not found" });
      }
      businessId = business._id;
    }

    const vehicle = await Vehicle.findOneAndDelete({
      _id: req.params.id,
      business: businessId,
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while deleting vehicle",
    });
  }
};

// ==========================================
// WORKING AREA CONTROLLERS (For ALL Roles)
// ==========================================

// 5. GET MY WORKING AREAS
exports.getMyWorkingAreas = async (req, res) => {
  try {
    const business = await Business.findOne({ user: req.user.id }).select("workingAreas");

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Working areas fetched successfully",
      data: business.workingAreas || [],
    });
  } catch (err) {
    console.error("Get Working Areas Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// 6. DELETE SPECIFIC WORKING AREA BY AREA ID OR STATE
exports.deleteWorkingArea = async (req, res) => {
  try {
    const { areaId, state } = req.body;

    if (!areaId && !state) {
      return res.status(400).json({
        success: false,
        message: "Please provide either areaId or state to delete",
      });
    }

    // Direct ObjectId se remove karega agar areaId mil jaye, warna state name se
    const pullCondition = areaId ? { _id: areaId } : { state: state };

    const business = await Business.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { workingAreas: pullCondition } },
      { new: true }
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Working area removed successfully",
      data: business.workingAreas,
    });
  } catch (err) {
    console.error("Delete Working Area Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};