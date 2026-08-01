const express = require("express");
const router = express.Router();

// Controller Import
const postController = require("../controllers/postController");

// Middlewares Import
const auth = require("../middlewhere/auth"); 
const upload = require("../middlewhere/multer"); 

// ==========================================
// POST / SHOWCASE ROUTES
// ==========================================

// 1. Image Upload (Max 10 Limit & Image-Only Check)
router.post(
  "/create",
  auth,
  upload.single("image"),
  postController.createPost
);

// 2. Get Logged-in User's Uploaded Images (Remaining Slots + Posts)
router.get(
  "/my-posts",
  auth,
  postController.getMyPosts
);

// 3. Delete Image (Cloudinary + MongoDB Delete)
router.delete(
  "/delete/:postId",
  auth,
  postController.deletePost
);

module.exports = router;