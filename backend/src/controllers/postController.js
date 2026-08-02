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
    const userId = req.user.id;
    console.log("userid",userId);
    console.log("userid2222",req.user.id);


    // 1. File Upload Validation
    if (!req.file) {
      return res.status(400).json({ message: "please select 1 image at a time" });
    }

    // 2. Strict Image Type Check
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: "Only these files (JPG, PNG, WEBP) type allowed!" });
    }

    // 3. Check User & Role
    console.log("userid",userId)
    const user = await User.findById(userId);
    console.log("userimage",user);
    if (!user) return res.status(404).json({ message: "User not exixting" });

    if (user.role === "user") {
      return res.status(403).json({ message: "Only service providers (Transporters, Brokers, etc.) are allowed to upload posts." });
    }

    // 4. Max 10 Limit Check
    const postCount = await Post.countDocuments({ user: userId });
    if (postCount >= 10) {
      return res.status(400).json({ message:  "Maximum upload limit reached. Only 10 images can be uploaded." });


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
      message: "Image uploaded successfully",
      post: newPost,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message:"We couldn't process your request at the moment. Please try again later. If the problem continues, contact our support team." });
  }
};

// 2. GET MY IMAGES (Logged-in User Profile Grid)
exports.getMyPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("getapi",userId);
    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalUploaded: posts.length,
      remainingSlots: 10 - posts.length,
      posts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "We couldn't process your request at the moment. Please try again later. If the problem continues, contact our support team." });
  }
};

// 3. DELETE IMAGE (Remove from DB & Cloudinary)
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Image not found" });

    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are only allowed to delete your own uploaded images." });
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
      message: "The image has been deleted successfully. You may now upload a new image.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "We couldn't process your request at the moment. Please try again later. If the problem continues, contact our support team." });
  }
};