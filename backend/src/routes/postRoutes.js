const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

// Path spelling check & auth middleware fix
const auth = require("../middlewhere/auth"); 

// Existing Multer middleware
const upload = require("../middlewhere/multer"); 

// ==========================================
// POST ROUTES
// ==========================================

// 1. Create New Post (Image upload + Max 10 limit check)
router.post(
  "/create",
  auth,
  upload.single("image"),
  postController.createPost
);

// 2. Get All Posts (Global Instagram-style Feed)
router.get("/feed", auth, postController.getAllPosts);

// 3. Get Logged-in Business User's Posts (My Profile Grid)
router.get("/my-posts", auth, postController.getMyPosts);

// 4. Get Specific Single Post Details
router.get("/detail/:postId", auth, postController.getPostById);

// 5. Delete Post (Cloudinary + Database cleanup)
router.delete("/delete/:postId", auth, postController.deletePost);

module.exports = router;