// models/Post.js
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    // Author / Business creator link
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    
    // Post image details (Single ya Multiple Cloudinary/S3 URL)
    imageUrl: {
      type: String,
      required: [true, "Image is required"],
    },
    
    caption: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // Likes counter and user IDs
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    
    likeCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Post || mongoose.model("Post", postSchema);