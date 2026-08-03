// // const Business = require("../models/business");

// // /**
// //  * @desc    Search businesses by State, City (Working Area), and Category
// //  * @route   GET /api/v1/businesses/search
// //  * @access  Public
// //  */
// // exports.searchBusinesses = async (req, res) => {
// //   try {
// //     const { state, city, category, page = 1, limit = 10 } = req.query;

// //     // Default filters: Active, Profile Unlocked, and Registration Completed
// //     const query = {
// //       isActive: true,
// //       profileUnlocked: true,
// //       registrationStatus: "completed",
// //     };

// //     // 1. Category Filter (Case-insensitive)
// //     if (category) {
// //       query.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
// //     }

// //     // 2. Working Area Filter (State + City in same sub-document)
// //     if (state || city) {
// //       const workingAreaCriteria = {};

// //       if (state) {
// //         workingAreaCriteria.state = { $regex: new RegExp(state.trim(), "i") };
// //       }

// //       if (city) {
// //         workingAreaCriteria.cities = { $in: [new RegExp(city.trim(), "i")] };
// //       }

// //       // $elemMatch ensures State & City belong to the SAME workingArea object
// //       query.workingAreas = { $elemMatch: workingAreaCriteria };
// //     }

// //     // Pagination
// //     const pageNum = parseInt(page, 10) || 1;
// //     const limitNum = parseInt(limit, 10) || 10;
// //     const skip = (pageNum - 1) * limitNum;

// //     // Search Query Execution
// //     const [businesses, totalCount] = await Promise.all([
// //       Business.find(query)
// //         .populate("user", "name profilePicture phoneNumber email")
// //         .select(
// //           "firmName category phoneNumber email address currentCity currentState pincode workingAreas averageRating totalReviews profileUnlocked createdAt"
// //         )
// //         // RANKING SORTING: Highest Rating -> Most Reviews -> Latest Profile
// //         .sort({ averageRating: -1, totalReviews: -1, createdAt: -1 })
// //         .skip(skip)
// //         .limit(limitNum),
// //       Business.countDocuments(query),
// //     ]);

// //     return res.status(200).json({
// //       success: true,
// //       message: "Search results fetched successfully",
// //       count: businesses.length,
// //       totalCount,
// //       totalPages: Math.ceil(totalCount / limitNum),
// //       currentPage: pageNum,
// //       data: businesses,
// //     });
// //   } catch (error) {
// //     console.error("Search API Error:", error);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Server error while searching businesses",
// //       error: error.message,
// //     });
// //   }
// // };




// const Business = require("../models/business");

// /**
//  * @desc    Search businesses by State, City (Working Area), and Category
//  * @route   GET /api/v1/businesses/search
//  * @access  Public
//  */
// exports.searchBusinesses = async (req, res) => {
//   try {
//     const { state, city,   firmName,category, page = 1, limit = 10 } = req.query;

//     // Default filters: Active and Registration Completed
  

//     // Agar sirf unlocked profiles hi dikhani ho, toh is line ko un-comment karein:
//     // query.profileUnlocked = true;

//     // Regex Safety Function (Special characters error na de)
//     const escapeRegex = (text) =>
//   text.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");

//     // 1. Category Filter (Case-insensitive)
//  if (category?.trim()) {
//   query.category = {
//     $regex: category.trim(),
//     $options: "i",
//   };
// }
//     // Firm Name Filter
// if (firmName?.trim()) {
//   query.firmName = {
//     $regex: firmName.trim(),
//     $options: "i",
//   };
// }
//     // // 2. Working Area Filter (State + City in same sub-document)
//     // if (state || city) {
//     //   const workingAreaCriteria = {};

//     //   if (state) {
//     //     workingAreaCriteria.state = { $regex: new RegExp(escapeRegex(state.trim()), "i") };
//     //   }

//     //   if (city) {
//     //     workingAreaCriteria.cities = { $in: [new RegExp(escapeRegex(city.trim()), "i")] };
//     //   }

//     //   query.workingAreas = { $elemMatch: workingAreaCriteria };
//     // }

//     // State Filter
//     console.log("STATE:", JSON.stringify(state));
// console.log("CITY:", JSON.stringify(city));
// console.log("CATEGORY:", JSON.stringify(category));
// if (state?.trim()) {
//   query.currentState = {
//     $regex: state.trim(),
//     $options: "i",
//   };
// }

// // City Filter
// if (city?.trim()) {
//   query.currentCity = {
//     $regex: city.trim(),
//     $options: "i",
//   };
// }

//     // Pagination Setup
//     const pageNum = parseInt(page, 10) || 1;
//     const limitNum = parseInt(limit, 10) || 10;
//     const skip = (pageNum - 1) * limitNum;

//     // Search Query Execution
//     console.log("QUERY:", query);
//     const [businesses, totalCount] = await Promise.all([
//       Business.find(query)
//         // 👈 FIX: User Schema ke hisab se 'mobile' aur 'role' fetch honge
//         .populate("user", "mobile role") 
//         .select(
//           "firmName category phoneNumber email address currentCity currentState pincode workingAreas averageRating totalReviews profileUnlocked createdAt"
//         )
//         .sort({ averageRating: -1, totalReviews: -1, createdAt: -1 })
//         .skip(skip)
//         .limit(limitNum),
//       Business.countDocuments(query),
//     ]);

//     return res.status(200).json({
//       success: true,
//       message: "Search results fetched successfully",
//       count: businesses.length,
//       totalCount,
//       totalPages: Math.ceil(totalCount / limitNum),
//       currentPage: pageNum,
//       data: businesses,
//     });
//   } catch (error) {
//     console.error("Search API Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while searching businesses",
//       error: error.message,
//     });
//   }
// };
const Business = require("../models/business");

/**
 * @desc    Search businesses by State, City, Category (Role), and Firm Name
 * @route   GET /api/v1/businesses/search
 * @access  Public
 */
exports.searchBusinesses = async (req, res) => {
  try {
    const { state, city, firmName, category, page = 1, limit = 10 } = req.query;

    // Base query: Aap chahe toh yahan active status ya registration status laga sakte hain
    const query = {};

    // 1. Firm Name Filter (Agar firmName diya gaya hai)
    if (firmName && firmName.trim() !== "") {
      query.firmName = {
        $regex: firmName.trim(),
        $options: "i",
      };
    }

    // 2. Category / Role Filter (Agar category di gayi hai)
    if (category && category.trim() !== "") {
      query.category = {
        $regex: category.trim(),
        $options: "i",
      };
    }

    // 3. Current State Filter (Agar state diya gaya hai)
    if (state && state.trim() !== "") {
      query.currentState = {
        $regex: state.trim(),
        $options: "i",
      };
    }

    // 4. Current City Filter (Agar city di gayi hai)
    if (city && city.trim() !== "") {
      query.currentCity = {
        $regex: city.trim(),
        $options: "i",
      };
    }

    // Pagination Setup
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    console.log("FINAL MONGODB QUERY:", query);

    // Search Query Execution
    const [businesses, totalCount] = await Promise.all([
      Business.find(query)
        .populate("user", "mobile role") // User schema se mobile aur role fetch karne ke liye
        .select(
          "firmName category phoneNumber email address currentCity currentState pincode workingAreas averageRating totalReviews profileUnlocked createdAt"
        )
        .sort({ averageRating: -1, totalReviews: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Business.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Search results fetched successfully",
      count: businesses.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      data: businesses,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while searching businesses",
      error: error.message,
    });
  }
};