const mongoose = require("mongoose");
const Business = require("../models/business");
const User = require("../models/register");
const Profile = require("../models/profile");
const Vehicle = require("../models/vehicle");
const Comment = require("../models/comments");
const Post = require("../models/Post");

/**
 * @desc    Get Business / Transporter Detail by ID
 * @route   GET /api/v1/transporters/:id
 * @access  Public
 */
const getTransporterById = async (req, res) => {
  try {
    const { id } = req.params;

    // =====================================================
    // 1. FETCH BUSINESS
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

    // Prepare ObjectIds and Strings for Query Safe Matching
    const transporterIds = [
      id,
      business._id.toString(),
      business.user ? business.user.toString() : null,
    ].filter(Boolean);

    const transporterObjectIds = transporterIds
      .filter((val) => mongoose.Types.ObjectId.isValid(val))
      .map((val) => new mongoose.Types.ObjectId(val));

    // =====================================================
    // 2. PARALLEL FETCHING
    // =====================================================
    const [user, profile, vehicles, posts, comments] = await Promise.all([
      User.findById(business.user).select("role subscription mobile"),
      Profile.findOne({ user: business.user }).select("name profileImage"),
      Vehicle.find({
        business: business._id,
        status: { $ne: "inactive" },
      }).select("vehicleType vehicleNumber capacity bodyType status"),
      Post.find({ user: business.user })
        .select("imageUrl caption likeCount createdAt")
        .sort({ createdAt: -1 }),

      // Safely search using both String and ObjectId arrays
      Comment.find({
        $or: [
          { transporter: { $in: transporterObjectIds } },
          { transporter: { $in: transporterIds } },
        ],
      })
        .select("rating comment createdAt user")
        .sort({ createdAt: -1 }),
    ]);

    // =====================================================
    // 3. FETCH COMMENT REVIEWERS' PROFILES
    // =====================================================
    const reviewerUserIds = comments
      .map((c) => c.user)
      .filter((userId) => userId != null);

    const reviewerProfiles = await Profile.find({
      user: { $in: reviewerUserIds },
    }).select("user name profileImage");

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
    // 4. RATING CALCULATION
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

        profile: {
          name: profile?.name || business.firmName || "",
          profileImage: profile?.profileImage || "",
        },

        role: user?.role || business.category || "",
        mobile: user?.mobile || "",

        phoneNumber: business.phoneNumber || "",
        email: business.email || "",
        address: business.address || "",
        currentCity: business.currentCity || "",
        currentState: business.currentState || "",
        pincode: business.pincode || "",
        workingAreas: business.workingAreas || [],

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