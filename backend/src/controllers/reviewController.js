const mongoose = require("mongoose");
const Review = require("../models/Review");
const User = require("../models/register");
const Profile = require("../models/profile");


// ======================================================
// 1. ADD REVIEW
// POST /api/reviews
// User can add
// ======================================================

const addReview = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const { rating, comment } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Rating is required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment is required",
      });
    }

    // -----------------------------
    // User check
    // -----------------------------

    const user = await User.findById(userId).select("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -----------------------------
    // Create review
    // -----------------------------

    const review = await Review.create({
      user: userId,
      rating,
      comment: comment.trim(),
    });

    // Profile fetch
    const profile = await Profile.findOne({
      user: userId,
    }).select("name firmName profileImage");

    return res.status(201).json({
      success: true,
      message: "Review added successfully",

      review: {
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,

        user: {
          _id: user._id,
          name: profile?.name || "",
          firmName: profile?.firmName || "",
          role: user.role,
          profileImage: profile?.profileImage || "",
        },
      },
    });

  } catch (error) {
    console.error("Add Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// ======================================================
// 2. GET ALL REVIEWS
// GET /api/reviews
//
// Home Page + Admin Panel
// ======================================================

const getAllReviews = async (req, res) => {
  try {

    const reviews = await Review.find()
      .populate({
        path: "user",
        select: "role",
      })
      .sort({ createdAt: -1 })
      .lean();

    // -----------------------------
    // Get all user IDs
    // -----------------------------

    const userIds = reviews
      .map((review) => review.user?._id)
      .filter(Boolean);

    // -----------------------------
    // Get profiles
    // -----------------------------

    const profiles = await Profile.find({
      user: { $in: userIds },
    })
      .select("user name firmName profileImage")
      .lean();

    // -----------------------------
    // Profile map
    // -----------------------------

    const profileMap = {};

    profiles.forEach((profile) => {
      profileMap[profile.user.toString()] = profile;
    });

    // -----------------------------
    // Final response
    // -----------------------------

    const formattedReviews = reviews.map((review) => {

      const userId = review.user?._id?.toString();

      const profile = profileMap[userId];

      return {
        _id: review._id,

        rating: review.rating,

        comment: review.comment,

        createdAt: review.createdAt,

        updatedAt: review.updatedAt,

        user: {
          _id: review.user?._id,

          name: profile?.name || "",

          firmName: profile?.firmName || "",

          role: review.user?.role || "",

          profileImage: profile?.profileImage || "",
        },
      };
    });


    // -----------------------------
    // Average Rating
    // -----------------------------

    const totalReviews = formattedReviews.length;

    const averageRating =
      totalReviews > 0
        ? (
            formattedReviews.reduce(
              (sum, review) => sum + review.rating,
              0
            ) / totalReviews
          ).toFixed(1)
        : "0.0";


    return res.status(200).json({
      success: true,

      totalReviews,

      averageRating: Number(averageRating),

      reviews: formattedReviews,
    });

  } catch (error) {

    console.error("Get Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// ======================================================
// 3. EDIT REVIEW
// PUT /api/reviews/:reviewId
//
// ONLY ADMIN
// ======================================================

const editReview = async (req, res) => {
  try {

    const { reviewId } = req.params;

    const { rating, comment } = req.body;


    // -----------------------------
    // Check Review ID
    // -----------------------------

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }


    // -----------------------------
    // Validation
    // -----------------------------

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment is required",
      });
    }


    // -----------------------------
    // Find review
    // -----------------------------

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }


    // -----------------------------
    // Update
    // -----------------------------

    review.rating = rating;

    review.comment = comment.trim();

    await review.save();


    return res.status(200).json({
      success: true,

      message: "Review updated successfully",

      review,
    });

  } catch (error) {

    console.error("Edit Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// ======================================================
// 4. DELETE REVIEW
// DELETE /api/reviews/:reviewId
//
// ONLY ADMIN
// ======================================================

const deleteReview = async (req, res) => {
  try {

    const { reviewId } = req.params;


    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }


    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }


    await Review.findByIdAndDelete(reviewId);


    return res.status(200).json({
      success: true,

      message: "Review deleted successfully",
    });

  } catch (error) {

    console.error("Delete Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


module.exports = {
  addReview,
  getAllReviews,
  editReview,
  deleteReview,
};