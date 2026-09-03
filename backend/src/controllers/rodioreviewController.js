const Review = require("../models/RodioReview");
const User = require("../models/register");
const Profile = require("../models/profile");
const Business = require("../models/business");

// ==========================================
// ADD / UPDATE MY REVIEW
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
    if (!rating || rating < 1 || rating > 5) {
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

    // Ek user ka ek hi review
    // Agar pehle se hai to update ho jayega
    const review = await Review.findOneAndUpdate(
      { user: userId },
      {
        rating: Number(rating),
        comment: comment.trim(),
        isActive: true,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
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
// ==========================================

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      isActive: true,
    })
      .populate("user", "mobile role")
      .sort({ createdAt: -1 })
      .lean();

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
        $match: {
          isActive: true,
        },
      },
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
// GET MY REVIEW
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

    const review = await Review.findOne({
      user: userId,
      isActive: true,
    });

    return res.status(200).json({
      success: true,
      review: review || null,
    });
  } catch (error) {
    console.error("Get My Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your review",
    });
  }
};


// ==========================================
// DELETE MY REVIEW
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

    const review = await Review.findOneAndDelete({
      user: userId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};