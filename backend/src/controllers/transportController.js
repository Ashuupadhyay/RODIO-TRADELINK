// // /*const Transporter = require("../models/business");
// // const Profile = require("../models/profile");
// // const Comment = require("../models/comments");

// // const getTransporterById = async (req, res) => {
// //   try {
// //     // Transporter Details
// //     const transporter = await Transporter.findById(req.params.id);

// //     if (!transporter) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Transporter not found",
// //       });
// //     }

// //     // Transporter Profile Image
// //     const transporterProfile = await Profile.findOne({
// //       user: transporter.user,
// //     }).select("profileImage");

// //     // Comments with User Details
// //     const comments = await Comment.find({
// //       transporter: transporter._id,
// //     })
// //       .populate({
// //         path: "user",
// //         select: "name email", // Change "name" if your User model uses fullName
// //       })
// //       .sort({ createdAt: -1 });

// //     // Add User Profile Image
// //     const commentsWithUserProfile = await Promise.all(
// //       comments.map(async (comment) => {
// //         const userProfile = await Profile.findOne({
// //           user: comment.user._id,
// //         }).select("profileImage");

// //         return {
// //           _id: comment._id,
// //           rating: comment.rating,
// //           comment: comment.comment,
// //           createdAt: comment.createdAt,

// //           user: {
// //             _id: comment.user._id,
// //             name: comment.user.name,
// //             email: comment.user.email,
// //             profileImage: userProfile?.profileImage || "",
// //           },
// //         };
// //       })
// //     );

// //     // Rating Calculation
// //     const totalRating = comments.reduce(
// //       (sum, item) => sum + item.rating,
// //       0
// //     );

// //     const averageRating =
// //       comments.length > 0
// //         ? totalRating / comments.length
// //         : 0;

// //     res.status(200).json({
// //       success: true,
// //       data: {
// //         ...transporter.toObject(),

// //         profileImage: transporterProfile?.profileImage || "",

// //         totalVehicles:
// //           transporter.vehicleTypes?.length || 0,

// //         phone:
// //           transporter.phoneNumber || "",

// //         averageRating: Number(
// //           averageRating.toFixed(1)
// //         ),

// //         totalReviews: comments.length,

// //         comments: commentsWithUserProfile,
// //       },
// //     });

// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: error.message,
// //     });
// //   }
// // };

// // module.exports = {
// //   getTransporterById,
// // };*/
// // const Business = require("../models/business");
// // const User = require("../models/register");
// // const Profile = require("../models/profile");
// // const Vehicle = require("../models/vehicle");
// // const Comment = require("../models/comments");
// // const Post = require("../models/Post");

// // const getTransporterById = async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     // =====================================================
// //     // BUSINESS
// //     // =====================================================

// //     const business = await Business.findOne({
// //       _id: id,
// //       registrationStatus: "completed",
// //       subscriptionStatus: "active",
// //       profileUnlocked: true,
// //       isActive: true,
// //     });

// //     if (!business) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Business not found",
// //       });
// //     }

// //     // =====================================================
// //     // USER
// //     // =====================================================

// //     const user = await User.findById(business.user).select("role");

// //     // =====================================================
// //     // PROFILE
// //     // =====================================================

// //     const profile = await Profile.findOne({
// //       user: business.user,
// //     }).select("name profileImage");

// //     // =====================================================
// //     // VEHICLES
// //     // =====================================================

// //     const vehicles = await Vehicle.find({
// //       business: business._id,
// //       status: { $ne: "inactive" },
// //     }).select(
// //       "vehicleType vehicleNumber capacity bodyType status"
// //     );


// //     const posts = await Post.find({ user: business.user })
// //       .select("imageUrl caption likeCount createdAt")
// //       .sort({ createdAt: -1 });
// //     // =====================================================
// //     // COMMENTS
// //     // =====================================================

// //     const comments = await Comment.find({
// //       transporter: business._id,
// //     })
// //       .populate("user", "_id")
// //       .sort({ createdAt: -1 });

// //     const reviews = await Promise.all(
// //       comments.map(async (item) => {
// //         const reviewer = await Profile.findOne({
// //           user: item.user._id,
// //         }).select("name profileImage");

// //         return {
// //           _id: item._id,
// //           rating: item.rating,
// //           comment: item.comment,
// //           createdAt: item.createdAt,

// //           user: {
// //             _id: item.user._id,
// //             name: reviewer?.name || "",
// //             profileImage:
// //               reviewer?.profileImage || "",
// //           },
// //         };
// //       })
// //     );

// //     // =====================================================
// //     // RATING
// //     // =====================================================

// //     const totalReviews = reviews.length;

// //     const totalRating = comments.reduce(
// //       (sum, item) => sum + item.rating,
// //       0
// //     );

// //     const averageRating =
// //       totalReviews > 0
// //         ? Number((totalRating / totalReviews).toFixed(1))
// //         : 0;

// //     // =====================================================
// //     // RESPONSE
// //     // =====================================================

// //     return res.status(200).json({
// //       success: true,

// //       data: {
// //         _id: business._id,

// //         category: business.category,
// //         firmName: business.firmName,

// //         profile: {
// //           name: profile?.name || "",
// //           profileImage:
// //             profile?.profileImage || "",
// //         },

// //         role: user?.role || "",

// //         phoneNumber:
// //           business.phoneNumber || "",

// //         email:
// //           business.email || "",

// //         address:
// //           business.address || "",

// //         currentCity:
// //           business.currentCity || "",

// //         currentState:
// //           business.currentState || "",

// //         pincode:
// //           business.pincode || "",

// //         workingAreas:
// //           business.workingAreas || [],

// //         totalVehicles:
// //           vehicles.length,

// //         vehicles,
// //         totalUploadedImages: posts.length,
// //         gallery: posts,

// //         averageRating,

       

// //         totalReviews,

// //         comments: reviews,
// //       },
// //     });
// //   } catch (error) {
// //     console.error(
// //       "GET PUBLIC BUSINESS ERROR:",
// //       error
// //     );

// //     return res.status(500).json({
// //       success: false,
// //       message:
// //         error.message ||
// //         "Failed to fetch business profile",
// //     });
// //   }
// // };

// // module.exports = {
// //   getTransporterById
// // };





// const Business = require("../models/business");
// const User = require("../models/register"); // User Model
// const Profile = require("../models/profile");
// const Vehicle = require("../models/vehicle");
// const Comment = require("../models/comments");
// const Post = require("../models/Post");

// /**
//  * @desc    Get Business Detail Page by ID (Works for ALL Roles)
//  * @route   GET /api/v1/businesses/:id
//  * @access  Public
//  */
// const getTransporterById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // =====================================================
//     // 1. FETCH BUSINESS
//     // =====================================================
//     // Soft filter: Active business check (Profile unlock/Subscription status flexible)
//     const business = await Business.findOne({
//       _id: id,
//       isActive: true,
//       registrationStatus: "completed",
//     });

//     if (!business) {
//       return res.status(404).json({
//         success: false,
//         message: "Business details not found or profile incomplete",
//       });
//     }

//     // =====================================================
//     // 2. PARALLEL FETCHING (Performance Optimization)
//     // =====================================================
//     const [user, profile, vehicles, posts, comments] = await Promise.all([
//       User.findById(business.user).select("role subscription mobile"),
//       Profile.findOne({ user: business.user }).select("name profileImage"),
//       Vehicle.find({
//         business: business._id,
//         status: { $ne: "inactive" },
//       }).select("vehicleType vehicleNumber capacity bodyType status"),
//       Post.find({ user: business.user })
//         .select("imageUrl caption likeCount createdAt")
//         .sort({ createdAt: -1 }),
//       Comment.find({ transporter: business._id })
//         .select("rating comment createdAt user")
//         .sort({ createdAt: -1 }),
//     ]);

//     // =====================================================
//     // 3. FETCH COMMENT USERS PROFILES (Single Query Optimization)
//     // =====================================================
//     const reviewerUserIds = comments.map((c) => c.user);
//     const reviewerProfiles = await Profile.find({
//       user: { $in: reviewerUserIds },
//     }).select("user name profileImage");

//     // Profile Map for fast lookup
//     const profileMap = {};
//     reviewerProfiles.forEach((p) => {
//       profileMap[p.user.toString()] = p;
//     });

//     const reviews = comments.map((item) => {
//       const reviewer = profileMap[item.user?.toString()];
//       return {
//         _id: item._id,
//         rating: item.rating,
//         comment: item.comment,
//         createdAt: item.createdAt,
//         user: {
//           _id: item.user,
//           name: reviewer?.name || "Anonymous",
//           profileImage: reviewer?.profileImage || "",
//         },
//       };
//     });

//     // =====================================================
//     // 4. RATING CALCULATION
//     // =====================================================
//     const totalReviews = reviews.length;
//     const totalRating = comments.reduce((sum, item) => sum + item.rating, 0);
//     const averageRating =
//       totalReviews > 0 ? Number((totalRating / totalReviews).toFixed(1)) : 0;

//     // =====================================================
//     // 5. UNIFIED RESPONSE FOR ALL ROLES
//     // =====================================================
//     return res.status(200).json({
//       success: true,
//       data: {
//         _id: business._id,
//         category: business.category,
//         firmName: business.firmName,

//         profile: {
//           name: profile?.name || business.firmName || "",
//           profileImage: profile?.profileImage || "",
//         },

//         role: user?.role || business.category || "",
//         mobile: user?.mobile || "",

//         phoneNumber: business.phoneNumber || "",
//         email: business.email || "",
//         address: business.address || "",
//         currentCity: business.currentCity || "",
//         currentState: business.currentState || "",
//         pincode: business.pincode || "",
//         workingAreas: business.workingAreas || [],

//         // Vehicles Section (Vehicles nahi honge toh empty array `[]` bhejega)
//         totalVehicles: vehicles.length,
//         vehicles: vehicles || [],

//         // Gallery/Posts Section
//         totalUploadedImages: posts.length,
//         gallery: posts || [],

//         // Ratings & Reviews
//         averageRating,
//         totalReviews,
//         comments: reviews,
//       },
//     });
//   } catch (error) {
//     console.error("GET BUSINESS DETAIL ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to fetch business details",
//     });
//   }
// };

// module.exports = {
//   getTransporterById,
// };


const Business = require("../models/business");
const User = require("../models/register");
const Profile = require("../models/profile");
const Vehicle = require("../models/vehicle");
const Comment = require("../models/comments");
const Post = require("../models/Post");
const BusinessDocument = require("../models/documents");

/**
 * @desc    Get Business / Transporter Detail by ID (Works with Business ID or User ID)
 * @route   GET /api/v1/transporters/:id
 * @access  Public
 */
const getTransporterById = async (req, res) => {
  try {
    const { id } = req.params;

    // =====================================================
    // 1. FETCH BUSINESS (Search by Business _id OR User _id)
    // =====================================================
    const business = await Business.findOne({
      $or: [{ _id: id }, { user: id }],
      isActive: true,
      registrationStatus: "completed",
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business details not found or profile incomplete",
      });
    }

    // =====================================================
    // 2. PARALLEL FETCHING (Vehicles, Posts, Comments, User, Profile)
    // =====================================================
    const [user, profile, vehicles, posts, comments,documents,] = await Promise.all([
      User.findById(business.user).select("role subscription mobile"),
      Profile.findOne({ user: business.user }).select("name profileImage"),
      Vehicle.find({
        business: business._id,
        status: { $ne: "inactive" },
      }).select("vehicleType vehicleNumber capacity bodyType status"),
      Post.find({ user: business.user })
        .select("imageUrl caption likeCount createdAt")
        .sort({ createdAt: -1 }),
      // FIX: Matches both Business ID and Business Owner User ID
      Comment.find({
        $or: [{ transporter: business._id }, { transporter: business.user }],
      })
        .select("rating comment createdAt user")
        .sort({ createdAt: -1 }),

BusinessDocument.find({
  business: business._id,
  isActive: true,
}).select(
  "documentType documentName documentUrl publicId verificationStatus"
),



    ]);





// 👇 YE YAHAN LAGANA HAI
console.log("========== DOCUMENT CHECK ==========");
console.log("BUSINESS ID:", business._id);
console.log("DOCUMENTS:", documents);
console.log(
  "VERIFICATION STATUS:",
  documents.map((doc) => doc.verificationStatus)
);
console.log("====================================");
    // =====================================================
    // 3. FETCH COMMENT REVIEWERS' PROFILES
    // =====================================================
    const reviewerUserIds = comments
      .map((c) => c.user)
      .filter((userId) => userId != null);

    const reviewerProfiles = await Profile.find({
      user: { $in: reviewerUserIds },
    }).select("user name profileImage");

    // Profile Map for fast O(1) lookup
    const profileMap = {};
    reviewerProfiles.forEach((p) => {
      if (p && p.user) {
        profileMap[p.user.toString()] = p;
      }
    });

    const reviews = comments.map((item) => {
      const reviewer = item.user ? profileMap[item.user.toString()] : null;
      return {
        _id: item._id,
        rating: Number(item.rating) || 0,
        comment: item.comment || "",
        createdAt: item.createdAt,
        user: {
          _id: item.user || null,
          name: reviewer?.name || "Anonymous",
          profileImage: reviewer?.profileImage || "",
        },
      };
    });

    // =====================================================
    // 4. SAFE RATING CALCULATION (Prevents NaN)
    // =====================================================
    const totalReviews = reviews.length;
    const totalRatingSum = comments.reduce(
      (sum, item) => sum + (Number(item.rating) || 0),
      0
    );
    const averageRating =
      totalReviews > 0 ? Number((totalRatingSum / totalReviews).toFixed(1)) : 0;

    // =====================================================
    // 5. UNIFIED RESPONSE
    // =====================================================
    return res.status(200).json({
      success: true,
      data: {
        _id: business._id,
        category: business.category || "",
        firmName: business.firmName || "",
        name: business.name || "",

        profile: {
          name: profile?.name || business.firmName || "",
          profileImage: profile?.profileImage || "",
        },

        role: user?.role || business.category || "",
        mobile: user?.mobile || "",

        phoneNumber: business.phoneNumber || "",
        alternatePhoneNumbers:
  business.alternatePhoneNumbers || [],

whatsappNumber:
  business.whatsappNumber || "",
        email: business.email || "",
        address: business.address || "",
        addresses:
  business.addresses || [],

landlineNumbers:
  business.landlineNumbers || [],
        currentCity: business.currentCity || "",
        currentState: business.currentState || "",
        pincode: business.pincode || "",
        website:
  business.website || "",

employeeRange:
  business.employeeRange || "",

officeWorkingHours:
  business.officeWorkingHours || {
    start: "",
    end: "",
  },

officeWorkingDays:
  business.officeWorkingDays || [],
        workingAreas: business.workingAreas || [],
        documents: documents || [],

        totalVehicles: vehicles.length,
        vehicles: vehicles || [],

        totalUploadedImages: posts.length,
        gallery: posts || [],

        averageRating,
        totalReviews,
        comments: reviews,
      },
    });
  } catch (error) {
    console.error("GET BUSINESS DETAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch business details",
    });
  }
};

module.exports = {
  getTransporterById,
};