
const Review = require("../models/RodioReview");
const User = require("../models/register");
const Profile = require("../models/profile");
const Business = require("../models/business");

// ==========================================
// ADD REVIEW
// One user can submit multiple reviews
// ==========================================

exports.addOrUpdateReview = async (req, res) => {
  try {
    const userId =
      req.user?._id ||
      req.user?.id ||
      req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const { rating, comment } = req.body;

    // Rating validation
    if (
      rating === undefined ||
      rating === null ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Comment validation
    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please write your review",
      });
    }

    // ==========================================
    // CREATE NEW REVIEW
    // Same user can create multiple reviews
    // ==========================================

    const review = await Review.create({
      user: userId,
      rating: Number(rating),
      comment: comment.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });

  } catch (error) {
    console.error("Add Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit review",
      error: error.message,
    });
  }
};


// ==========================================
// GET ALL RODIO REVIEWS
// ALL USERS + ALL REVIEWS
// ==========================================

exports.getAllReviews = async (req, res) => {
  try {
    // No isActive filter
    // Every review from every user will come
    const reviews = await Review.find({})
      .populate("user", "mobile role")
      .sort({ createdAt: -1 })
      .lean();

    console.log("TOTAL REVIEWS:", reviews.length);

    const formattedReviews = await Promise.all(
      reviews.map(async (review) => {
        const userId = review.user?._id;

        let profile = null;
        let business = null;

        if (userId) {
          profile = await Profile.findOne({
            user: userId,
          }).lean();

          business = await Business.findOne({
            user: userId,
          }).lean();
        }

        return {
          _id: review._id,

          rating: review.rating,

          comment: review.comment,

          createdAt: review.createdAt,

          updatedAt: review.updatedAt,

          user: {
            _id: userId,

            role:
              review.user?.role ||
              profile?.role ||
              business?.category ||
              "",

            name:
              profile?.name ||
              business?.name ||
              "RODIO User",

            firmName:
              profile?.firmName ||
              business?.firmName ||
              "",

            profileImage:
              profile?.profileImage ||
              "",
          },
        };
      })
    );

    // ==========================================
    // AVERAGE RATING
    // ==========================================

    const ratingStats = await Review.aggregate([
      {
        $group: {
          _id: null,

          averageRating: {
            $avg: "$rating",
          },

          totalReviews: {
            $sum: 1,
          },
        },
      },
    ]);

    const averageRating =
      ratingStats.length > 0
        ? Number(
            ratingStats[0].averageRating.toFixed(1)
          )
        : 0;

    const totalReviews =
      ratingStats.length > 0
        ? ratingStats[0].totalReviews
        : 0;

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      averageRating,

      totalReviews,

      reviews: formattedReviews,
    });

  } catch (error) {
    console.error("Get Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};


// ==========================================
// GET MY REVIEWS
// Returns ALL reviews of logged-in user
// ==========================================

exports.getMyReview = async (req, res) => {
  try {
    const userId =
      req.user?._id ||
      req.user?.id ||
      req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const reviews = await Review.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      totalReviews: reviews.length,
      reviews,
    });

  } catch (error) {
    console.error("Get My Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your reviews",
      error: error.message,
    });
  }
};


// ==========================================
// DELETE MY REVIEWS
// Deletes ALL reviews of logged-in user
// ==========================================

exports.deleteMyReview = async (req, res) => {
  try {
    const userId =
      req.user?._id ||
      req.user?.id ||
      req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const result = await Review.deleteMany({
      user: userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All your reviews deleted successfully",
      deletedCount: result.deletedCount,
    });

  } catch (error) {
    console.error("Delete Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete reviews",
      error: error.message,
    });
  }
};
