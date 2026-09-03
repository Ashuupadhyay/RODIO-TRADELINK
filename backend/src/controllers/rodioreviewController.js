const mongoose = require("mongoose");

const Review = require("../models/RodioReview");
const Profile = require("../models/profile");
const Business = require("../models/business");

// ==========================================
// HELPER - GET LOGGED IN USER ID
// ==========================================
const getUserId = (req) => {
  return req.user?._id || req.user?.id || req.userId || null;
};


// ==========================================
// 1. ADD REVIEW
// One user can submit multiple reviews
// ==========================================
exports.addOrUpdateReview = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const { rating, comment } = req.body || {};

    // ------------------------------------------
    // Rating validation
    // ------------------------------------------
    if (
      rating === undefined ||
      rating === null ||
      rating === "" ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // ------------------------------------------
    // Comment validation
    // ------------------------------------------
    if (
      typeof comment !== "string" ||
      !comment.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please write your review",
      });
    }

    // ------------------------------------------
    // CREATE NEW REVIEW
    // Multiple reviews allowed
    // ------------------------------------------
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
// 2. GET ALL REVIEWS
// ALL USERS + ALL REVIEWS
// ==========================================
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate("user", "mobile role")
      .sort({
        createdAt: -1,
      })
      .lean();

    console.log("TOTAL REVIEWS:", reviews.length);

    // ------------------------------------------
    // Format reviews
    // ------------------------------------------
    const formattedReviews = await Promise.all(
      reviews.map(async (review) => {
        const userId = review.user?._id || review.user || null;

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

            mobile:
              review.user?.mobile ||
              "",
          },
        };
      })
    );

    // ------------------------------------------
    // Rating statistics
    // ------------------------------------------
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
      ratingStats.length > 0 &&
      ratingStats[0].averageRating !== undefined
        ? Number(
            Number(ratingStats[0].averageRating).toFixed(1)
          )
        : 0;

    const totalReviews =
      ratingStats.length > 0
        ? ratingStats[0].totalReviews
        : 0;

    // ------------------------------------------
    // Response
    // ------------------------------------------
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
// 3. GET MY REVIEWS
// Returns ALL reviews of logged-in user
// ==========================================
exports.getMyReview = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const reviews = await Review.find({
      user: userId,
    })
      .sort({
        createdAt: -1,
      })
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
// 4. DELETE MY REVIEWS
// Deletes ALL reviews of logged-in user
// ==========================================
exports.deleteMyReview = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you are not allowed to delete it",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      review,
    });

  } catch (error) {
    console.error("Delete My Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};


// ==========================================
// 5. ADMIN UPDATE REVIEW
// PUT /api/admin/reviews/:id
// ==========================================
exports.adminUpdateReview = async (req, res) => {
  try {
    const { id } = req.params;

    // ------------------------------------------
    // Check ID
    // ------------------------------------------
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    // ------------------------------------------
    // Safe body
    // ------------------------------------------
    const { rating, comment } = req.body || {};

    // ------------------------------------------
    // Rating validation
    // ------------------------------------------
    if (
      rating === undefined ||
      rating === null ||
      rating === "" ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // ------------------------------------------
    // Comment validation
    // ------------------------------------------
    if (
      typeof comment !== "string" ||
      !comment.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please write your review",
      });
    }

    // ------------------------------------------
    // UPDATE REVIEW
    // ------------------------------------------
    const review = await Review.findByIdAndUpdate(
      id,
      {
        rating: Number(rating),
        comment: comment.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });

  } catch (error) {
    console.error("Admin Update Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: error.message,
    });
  }
};


// ==========================================
// 6. ADMIN DELETE REVIEW
// DELETE /api/admin/reviews/:id
// ==========================================
exports.adminDeleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    // ------------------------------------------
    // Check ID
    // ------------------------------------------
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    // ------------------------------------------
    // DELETE REVIEW
    // ------------------------------------------
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      review,
    });

  } catch (error) {
    console.error("Admin Delete Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};