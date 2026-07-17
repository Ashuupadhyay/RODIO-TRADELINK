const Transporter = require("../models/business");
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
};