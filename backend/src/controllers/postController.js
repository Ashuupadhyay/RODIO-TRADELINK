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

// 1. UPLOAD IMAGE (Max 10 Limit & Image-Only Validation)
exports.createPost = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. File Upload Validation
    if (!req.file) {
      return res.status(400).json({ message: "Kripya ek image file select karein." });
    }

    // 2. Strict Image Type Check
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: "Keval Image files (JPG, PNG, WEBP) hi allowed hain!" });
    }

    // 3. Check User & Role
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User nahi mila" });

    if (user.role === "user") {
      return res.status(403).json({ message: "Normal users images upload nahi kar sakte." });
    }

    // 4. Max 10 Limit Check
    const postCount = await Post.countDocuments({ user: userId });
    if (postCount >= 10) {
      return res.status(400).json({ message: "Limit poori ho chuki hai! Aap max 10 images hi upload kar sakte hain." });
    }

    // 5. Upload to Cloudinary
    const cloudResult = await uploadToCloudinary(req.file.buffer);

    // 6. Save in DB
    const newPost = new Post({
      user: userId,
      imageUrl: cloudResult.secure_url,
      caption: req.body.caption || "",
    });

    await newPost.save();

    return res.status(201).json({
      success: true,
      message: "Image successfully upload ho gayi hai",
      post: newPost,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET MY IMAGES (Logged-in User Profile Grid)
exports.getMyPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalUploaded: posts.length,
      remainingSlots: 10 - posts.length,
      posts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. DELETE IMAGE (Remove from DB & Cloudinary)
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Image nahi mili" });

    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Aap sirf apni uploaded images delete kar sakte hain." });
    }

    // Cloudinary Delete Logic
    if (post.imageUrl) {
      const urlParts = post.imageUrl.split("/");
      const fileNameWithExt = urlParts[urlParts.length - 1];
      const publicId = fileNameWithExt.split(".")[0];
      await cloudinary.uploader.destroy(`social_posts/${publicId}`);
    }

    await Post.findByIdAndDelete(postId);

    return res.status(200).json({
      success: true,
      message: "Image delete ho gayi. Aap ab nayi image upload kar sakte hain.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};