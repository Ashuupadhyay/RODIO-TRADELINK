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






const getTransporterComments = async (req, res) => {
  try {
    const transporter = await Business.findById(req.params.id);
    console.log(transporter);

    if (!transporter) {
      return res.status(404).json({
        success: false,
        message: "Transporter not found",
      });
    }

    const comments = await Comment.find({
      transporter: req.params.id,
    })
      .populate("user", "name email mobile")
      .sort({ createdAt: -1 });
      console.log(comments);

    const commentsWithProfile = await Promise.all(
      comments.map(async (comment) => {
        const profile = await Profile.findOne({ user: comment.user._id });
 console.log(commentsWithProfile)
        return {
          _id: comment._id,
          rating: comment.rating,
          comment: comment.comment,
          createdAt: comment.createdAt,
          user: {
            _id: comment.user._id,
            name: comment.user.name,
            email: comment.user.email,
            mobile: comment.user.mobile,
            profileImage:
              profile?.profileImage ||
              "https://res.cloudinary.com/tyt9mt1f/image/upload/v1784103262/DUMMYIMAGE_xuc0xa.jpg",
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      totalReviews: transporter.totalReviews,
      averageRating: transporter.averageRating,
      comments: commentsWithProfile,
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
  getTransporterComments,
};