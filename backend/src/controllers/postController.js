const Post = require("../models/Post");
const User = require("../models/register");
const cloudinary = require("../config/cloudnary");

// Cloudinary Buffer Upload Helper Function
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "social_posts",
        resource_type: "image",
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(fileBuffer);
  });
};

// 1. CREATE POST
exports.createPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { caption } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "user") {
      return res.status(403).json({
        message: "Normal users are not allowed to create posts.",
      });
    }

    const postCount = await Post.countDocuments({ user: userId });
    if (postCount >= 10) {
      return res.status(400).json({
        message: "Post limit reached! You can only upload up to 10 posts.",
      });
    }

    const cloudResult = await uploadToCloudinary(req.file.buffer);

    const newPost = new Post({
      user: userId,
      imageUrl: cloudResult.secure_url,
      caption: caption || "",
    });

    await newPost.save();

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET ALL POSTS (Global Social Feed - Instagram Feed)
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "mobile role") // Business profile info fetch karne ke liye
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET MY POSTS (Logged-in User/Business Grid - Instagram Profile Grid)
exports.getMyPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalUploaded: posts.length,
      remainingSlots: 10 - posts.length, // Batayega kitni posts bachi hain (out of 10)
      posts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. GET SINGLE POST BY ID
exports.getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate("user", "mobile role");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. DELETE POST (Database + Cloudinary clean up)
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    // Post dhoondein
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check karein ki post usi user ki hai na
    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Unauthorized! You can only delete your own posts.",
      });
    }

    // Cloudinary se Image Delete karne ke liye Public ID extract karein
    if (post.imageUrl) {
      const urlParts = post.imageUrl.split("/");
      const fileNameWithExt = urlParts[urlParts.length - 1]; // e.g., sample.jpg
      const publicId = fileNameWithExt.split(".")[0]; // e.g., sample
      const folderName = "social_posts";

      // Cloudinary se delete karein
      await cloudinary.uploader.destroy(`${folderName}/${publicId}`);
    }

    // Database se Delete karein
    await Post.findByIdAndDelete(postId);

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully. You can now upload a new post.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};