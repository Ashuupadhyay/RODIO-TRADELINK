/*const Transporter = require("../models/business");
const Profile = require("../models/profile");
const Comment = require("../models/comments");

const getTransporterById = async (req, res) => {
  try {
    // Transporter Details
    const transporter = await Transporter.findById(req.params.id);

    if (!transporter) {
      return res.status(404).json({
        success: false,
        message: "Transporter not found",
      });
    }

    // Transporter Profile Image
    const transporterProfile = await Profile.findOne({
      user: transporter.user,
    }).select("profileImage");

    // Comments with User Details
    const comments = await Comment.find({
      transporter: transporter._id,
    })
      .populate({
        path: "user",
        select: "name email", // Change "name" if your User model uses fullName
      })
      .sort({ createdAt: -1 });

    // Add User Profile Image
    const commentsWithUserProfile = await Promise.all(
      comments.map(async (comment) => {
        const userProfile = await Profile.findOne({
          user: comment.user._id,
        }).select("profileImage");

        return {
          _id: comment._id,
          rating: comment.rating,
          comment: comment.comment,
          createdAt: comment.createdAt,

          user: {
            _id: comment.user._id,
            name: comment.user.name,
            email: comment.user.email,
            profileImage: userProfile?.profileImage || "",
          },
        };
      })
    );

    // Rating Calculation
    const totalRating = comments.reduce(
      (sum, item) => sum + item.rating,
      0
    );

    const averageRating =
      comments.length > 0
        ? totalRating / comments.length
        : 0;

    res.status(200).json({
      success: true,
      data: {
        ...transporter.toObject(),

        profileImage: transporterProfile?.profileImage || "",

        totalVehicles:
          transporter.vehicleTypes?.length || 0,

        phone:
          transporter.phoneNumber || "",

        averageRating: Number(
          averageRating.toFixed(1)
        ),

        totalReviews: comments.length,

        comments: commentsWithUserProfile,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getTransporterById,
};*/
const Business = require("../models/business");
const User = require("../models/register");
const Profile = require("../models/profile");
const Vehicle = require("../models/vehicle");
const Comment = require("../models/comments");

const getTransporterById = async (req, res) => {
  try {
    const { id } = req.params;

    // =====================================================
    // BUSINESS
    // =====================================================

    const business = await Business.findOne({
      _id: id,
      registrationStatus: "completed",
      subscriptionStatus: "active",
      profileUnlocked: true,
      isActive: true,
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // =====================================================
    // USER
    // =====================================================

    const user = await User.findById(business.user).select("role");

    // =====================================================
    // PROFILE
    // =====================================================

    const profile = await Profile.findOne({
      user: business.user,
    }).select("name profileImage");

    // =====================================================
    // VEHICLES
    // =====================================================

    const vehicles = await Vehicle.find({
      business: business._id,
      status: { $ne: "inactive" },
    }).select(
      "vehicleType vehicleNumber capacity bodyType status"
    );

    // =====================================================
    // COMMENTS
    // =====================================================

    const comments = await Comment.find({
      transporter: business._id,
    })
      .populate("user", "_id")
      .sort({ createdAt: -1 });

    const reviews = await Promise.all(
      comments.map(async (item) => {
        const reviewer = await Profile.findOne({
          user: item.user._id,
        }).select("name profileImage");

        return {
          _id: item._id,
          rating: item.rating,
          comment: item.comment,
          createdAt: item.createdAt,

          user: {
            _id: item.user._id,
            name: reviewer?.name || "",
            profileImage:
              reviewer?.profileImage || "",
          },
        };
      })
    );

    // =====================================================
    // RATING
    // =====================================================

    const totalReviews = reviews.length;

    const totalRating = comments.reduce(
      (sum, item) => sum + item.rating,
      0
    );

    const averageRating =
      totalReviews > 0
        ? Number((totalRating / totalReviews).toFixed(1))
        : 0;

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,

      data: {
        _id: business._id,

        category: business.category,
        firmName: business.firmName,

        profile: {
          name: profile?.name || "",
          profileImage:
            profile?.profileImage || "",
        },

        role: user?.role || "",

        phoneNumber:
          business.phoneNumber || "",

        email:
          business.email || "",

        address:
          business.address || "",

        currentCity:
          business.currentCity || "",

        currentState:
          business.currentState || "",

        pincode:
          business.pincode || "",

        workingAreas:
          business.workingAreas || [],

        totalVehicles:
          vehicles.length,

        vehicles,

        averageRating,

        totalReviews,

        comments: reviews,
      },
    });
  } catch (error) {
    console.error(
      "GET PUBLIC BUSINESS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch business profile",
    });
  }
};

module.exports = {
  getTransporterById
};