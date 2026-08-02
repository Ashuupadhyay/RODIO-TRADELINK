// const Business = require("../models/business");

// exports.addWorkingAreas = async (req, res) => {
//   try {
//     const { workingAreas } = req.body;

//     if (!workingAreas || !Array.isArray(workingAreas)) {
//       return res.status(400).json({
//         success: false,
//         message: "Working areas are required",
//       });
//     }

//     const business = await Business.findOneAndUpdate(
//       { user: req.user.id },
//       {
//         $set: {
//           workingAreas,
//         },
//       },
//       {
//         new: true,
//         runValidators: false,
//       }
//     );

//     if (!business) {
//       return res.status(404).json({
//         success: false,
//         message: "Business not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Working areas updated successfully",
//       data: business.workingAreas,
//     });
//   } catch (err) {
//     console.error("Working Area Error:", err);

//     return res.status(500).json({
//       success: false,
//       message: err.message,
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

// // 3. DELETE SPECIFIC WORKING AREA (By State or Area ID)
// exports.deleteWorkingArea = async (req, res) => {
//   try {
//     const { areaId, state } = req.body;

//     if (!areaId && !state) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide either areaId or state to delete",
//       });
//     }

//     // Direct Subdocument ID se delete karega agar areaId passing ho, warna state name se
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
const Business = require("../models/business");

// 1. ADD / UPDATE WORKING AREAS (Append Or Replace Safely)
exports.addWorkingAreas = async (req, res) => {
  try {
    const { workingAreas } = req.body;

    if (!workingAreas || !Array.isArray(workingAreas) || workingAreas.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Working areas array is required and cannot be empty",
      });
    }

    // Business Profile Find Karo
    let business = await Business.findOne({ user: req.user.id });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found. Please create profile first.",
      });
    }

    // Existing workingAreas ke sath Merge / Replace Logic
    // Option A: Clean Update (Complete Set)
    business.workingAreas = workingAreas;

    await business.save();

    return res.status(200).json({
      success: true,
      message: "Working areas updated successfully",
      data: business.workingAreas,
    });
  } catch (err) {
    console.error("Working Area Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Server error while saving working areas",
    });
  }
};

// 2. GET MY WORKING AREAS
exports.getMyWorkingAreas = async (req, res) => {
  try {
    const business = await Business.findOne({ user: req.user.id }).select(
      "workingAreas"
    );

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
      message: err.message || "Server error while fetching working areas",
    });
  }
};

// 3. DELETE SPECIFIC WORKING AREA (By Area ID or State)
exports.deleteWorkingArea = async (req, res) => {
  try {
    const { areaId, state } = req.body;

    if (!areaId && !state) {
      return res.status(400).json({
        success: false,
        message: "Please provide either areaId or state to delete",
      });
    }

    // Direct Subdocument ID se delete karega agar areaId passing ho, warna state name se
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
      message: err.message || "error while removing working area",
    });
  }
};