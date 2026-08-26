// const Business = require("../models/business");
// const Post = require("../models/Post"); // 👈 Yeh line add karein
// const getDashboard = async (req, res) => {
//   try {
//     const userId = req.user.id;
// // Uploaded posts/images fetch karne ke liye
// const userPosts = await Post.find({ user: userId }).sort({ createdAt: -1 });
//     const business = await Business.findOne({
//       user: userId,
//     }).populate(
//       "user",
//       "name email mobile role subscription referralCode"
//     );

//     if (!business) {
//       return res.status(404).json({
//         success: false,
//         message: "Business profile not found",
//       });
//     }

//     // ============================
//     // SUBSCRIPTION STATUS
//     // ============================

//     const subscriptionStatus =
//       business.user?.subscription?.status || "inactive";

//     // ============================
//     // REFERRAL
//     // ============================

//     const hasActiveSubscription =
//       subscriptionStatus === "active";

//     return res.status(200).json({
//       success: true,
//       data: {
//         // User
//         name: business.user?.name || "",
//         role: business.user?.role || "",
//         email: business.user?.email || "",
//         mobile: business.user?.mobile || "",

//         // Business
//         firmName: business.firmName || "",
//         ownerName: business.ownerName || "",
//         profileCompleted:
//           business.profileCompleted || false,

//         // Subscription
//         subscription: {
//           status: subscriptionStatus,

//           plan:
//             business.user?.subscription?.plan ||
//             "Monthly",

//           startDate:
//             business.user?.subscription?.startDate ||
//             null,

//           endDate:
//             business.user?.subscription?.endDate ||
//             null,
//         },

//         // Referral
//         referral: {
//           referralCode: hasActiveSubscription
//             ? business.user?.referralCode || null
//             : null,

//           message: hasActiveSubscription
//             ? null
//             : "You don't have a referral code. First add a service.",
//         },
//         uploadedImages: {
//   totalUploaded: userPosts.length,
//   remainingSlots: 10 - userPosts.length,
//   posts: userPosts,
// },
//       },
//     });
//   } catch (error) {
//     console.error("Dashboard Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to load dashboard",
//       error:"We couldn't process your request at the moment. Please try again later. If the problem continues, contact our support team."
//     });
//   }
// };
const Subscription = require("../models/suscription");
const Business = require("../models/business");
const Post = require("../models/Post")
const getDashboard = async (req, res) => {
  try {
    const business = await Business.findOne({ user: req.user.id })
      .populate(
        "user",
        "name email mobile role subscription referralCode"
      )
      .lean();

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const paymentSubscription = await Subscription.findOne({
      business: business._id,
      status: "paid",
    })
      .sort({ createdAt: -1 })
      .lean();
// ==========================================
// SUBSCRIPTION EXPIRY CHECK
// ==========================================

const userSubscription = business.user?.subscription;

const endDate = userSubscription?.endDate
  ? new Date(userSubscription.endDate)
  : null;

const now = new Date();

// Subscription expired?
const isExpired =
  !!endDate && now >= endDate;

// 2 days before expiry
const warningDate = endDate
  ? new Date(
      endDate.getTime() - 2 * 24 * 60 * 60 * 1000
    )
  : null;

// Show warning between:
// warningDate <= now < endDate
const expiresSoon =
  !!endDate &&
  now >= warningDate &&
  now < endDate;

// Actual active subscription
const hasActiveSubscription =
  userSubscription?.status === "active" &&
  !isExpired;

// Final access/unlock condition
const unlocked =
  business.registrationStatus === "completed" &&
  business.subscriptionStatus === "active" &&
  business.profileUnlocked === true &&
  hasActiveSubscription;
    // const unlocked =
    //   business.registrationStatus === "completed" &&
    //   business.subscriptionStatus === "active" &&
    //   business.profileUnlocked === true;

    // const subscriptionStatus =
    //   business.user?.subscription?.status || "inactive";

    // const hasActiveSubscription =
    //   subscriptionStatus === "active";

    return res.status(200).json({
      success: true,

      data: {
        // ==========================================
        // BUSINESS BASIC
        // ==========================================
        businessId: business._id,

        firmName: business.firmName || "",
        ownerName: business.ownerName || "",
        name: business.name || "",

        category: business.category || "",

        // ==========================================
        // ADDRESS & LOCATION
        // ==========================================
        address: business.address || "",
        currentCity: business.currentCity || "",
        currentState: business.currentState || "",
        pincode: business.pincode || "",

        // ==========================================
        // CONTACT DETAILS
        // ==========================================
        phoneNumber: business.phoneNumber || "",

        // Multiple mobile numbers
        alternatePhoneNumbers:
          business.alternatePhoneNumbers || [],

        email: business.email || "",

        // ==========================================
        // WORKING AREAS
        // ==========================================
        workingAreas: business.workingAreas || [],

        // ==========================================
        // USER
        // ==========================================
        user: {
          id: business.user?._id || null,
          name: business.user?.name || "",
          role: business.user?.role || "",
          mobile: business.user?.mobile || "",
          email: business.user?.email || "",
        },

        // ==========================================
        // SUBSCRIPTION
        // ==========================================
        subscription: {
  status: isExpired
    ? "expired"
    : userSubscription?.status || "inactive",

  plan:
    userSubscription?.plan || "",

  startDate:
    userSubscription?.startDate || null,

  endDate:
    userSubscription?.endDate || null,

  expiresSoon: expiresSoon,

  expiryMessage: expiresSoon
    ? "Your subscription expires soon."
    : null,
},

        // ==========================================
        // PAYMENT SUBSCRIPTION
        // ==========================================
        paymentSubscription,

        // ==========================================
        // REGISTRATION
        // ==========================================
        registrationStatus:
          business.registrationStatus,

        subscriptionStatus:
  isExpired
    ? "expired"
    : business.subscriptionStatus,

       profileUnlocked:
  unlocked,

        // ==========================================
        // REFERRAL
        // ==========================================
        referral: {
          referralCode: hasActiveSubscription
            ? business.user?.referralCode || null
            : null,

         message: hasActiveSubscription
  ? null
  : isExpired
    ? "Your subscription has expired. Renew your subscription to use referral features."
    : "You don't have an active subscription.",
        },

        // ==========================================
        // PERMISSIONS
        // ==========================================
        permissions: {
          canAddVehicle: unlocked,
          canAddRoutes: unlocked,
          canAddWorkingAreas: unlocked,
          canUploadDocuments: unlocked,
          canEditFullProfile: unlocked,
        },
      },
    });
  } catch (error) {
    console.error("GET DASHBOARD ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        "We couldn't process your request at the moment. Please try again later.",
    });
  }
};
module.exports = {
  getDashboard,
};