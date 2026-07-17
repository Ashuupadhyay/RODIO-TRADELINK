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

    const profile = await Profile.findOne({
      user: req.user.id,
    });

    const review = await Comment.create({
      transporter: transporter._id,
      user: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment,
    });

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
    addComment
}