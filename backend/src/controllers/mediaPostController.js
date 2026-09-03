const MediaPost = require("../models/MediaPost");
const {
  uploadMediaToCloudinary,
  deleteFromCloudinary,
} = require("../config/cloudnary");

// ==========================================
// CREATE MEDIA POST
// Multiple Images + Videos
// ==========================================

exports.createMediaPost = async (req, res) => {
  try {
    const { title, caption } = req.body || {};

    // ------------------------------------------
    // CHECK FILES
    // ------------------------------------------

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image or video",
      });
    }

    // ------------------------------------------
    // UPLOAD ALL FILES TO CLOUDINARY
    // ------------------------------------------

    const uploadedMedia = [];

    for (const file of req.files) {
      try {
        const result = await uploadMediaToCloudinary(
          file.buffer,
          "rodio_media"
        );

        uploadedMedia.push({
          url: result.url,
          publicId: result.publicId,
          resourceType: result.resourceType,
          format: result.format || "",
          width: result.width || null,
          height: result.height || null,
          duration: result.duration || null,
        });
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);

        // Agar koi upload fail ho jaye to
        // already uploaded files ko bhi delete karo
        for (const uploaded of uploadedMedia) {
          try {
            await deleteFromCloudinary(
              uploaded.publicId,
              uploaded.resourceType
            );
          } catch (deleteError) {
            console.error(
              "Cloudinary Cleanup Error:",
              deleteError
            );
          }
        }

        return res.status(500).json({
          success: false,
          message: "Failed to upload media",
          error: uploadError.message,
        });
      }
    }

    // ------------------------------------------
    // SAVE POST IN MONGODB
    // ------------------------------------------

    const post = await MediaPost.create({
      title: title?.trim() || "",
      caption: caption?.trim() || "",
      media: uploadedMedia,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Media post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create Media Post Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create media post",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL ACTIVE MEDIA POSTS
// Website ke liye
// ==========================================

exports.getActiveMediaPosts = async (req, res) => {
  try {
    const posts = await MediaPost.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      total: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Get Active Media Posts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch media posts",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL MEDIA POSTS
// Admin panel ke liye
// ==========================================

exports.getAllMediaPosts = async (req, res) => {
  try {
    const posts = await MediaPost.find({})
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      total: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Get All Media Posts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch media posts",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE MEDIA POST
// MongoDB + Cloudinary dono se delete
// ==========================================

exports.deleteMediaPost = async (req, res) => {
  try {
    const { id } = req.params;

    // ------------------------------------------
    // FIND POST
    // ------------------------------------------

    const post = await MediaPost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Media post not found",
      });
    }

    // ------------------------------------------
    // DELETE ALL CLOUDINARY FILES
    // ------------------------------------------

    if (post.media && post.media.length > 0) {
      for (const item of post.media) {
        try {
          await deleteFromCloudinary(
            item.publicId,
            item.resourceType
          );
        } catch (cloudinaryError) {
          console.error(
            "Cloudinary Delete Error:",
            cloudinaryError
          );
        }
      }
    }

    // ------------------------------------------
    // DELETE MONGODB POST
    // ------------------------------------------

    await MediaPost.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Media post deleted successfully",
    });
  } catch (error) {
    console.error("Delete Media Post Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete media post",
      error: error.message,
    });
  }
};