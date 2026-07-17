const Comment = require("../models/comments");
const Business = require("../models/business");
const Profile = require("../models/profile");

const addComment = async (req, res) => {
  try {
    const transporter = await Business.findById(req.params.id);

    if (!transporter) {
      return res.status(404).json({
        success: false,
        message: "Transporter not found",
      });
    }

    await Profile.findOne({
      user: req.user.id,
    });

    // Create Review
    const review = await Comment.create({
      transporter: transporter._id,
      user: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    // Push review into transporter
    transporter.comments.push(review._id);

    // Get all reviews of transporter
    const reviews = await Comment.find({
      transporter: transporter._id,
    });

    transporter.totalReviews = reviews.length;

    transporter.averageRating =
      reviews.reduce((sum, item) => sum + item.rating, 0) /
      reviews.length;

    await transporter.save();

    res.status(201).json({
      success: true,
      review,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addComment,
};