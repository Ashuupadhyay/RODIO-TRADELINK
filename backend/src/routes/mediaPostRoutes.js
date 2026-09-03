const express = require("express");

const router = express.Router();

const {
  createMediaPost,
  getActiveMediaPosts,
  getAllMediaPosts,
  deleteMediaPost,
} = require("../controllers/mediaPostController");

const { upload } = require("../config/cloudnary");

// ==========================================
// WEBSITE
// GET ACTIVE MEDIA POSTS
// ==========================================

router.get("/", getActiveMediaPosts);

// ==========================================
// ADMIN
// GET ALL MEDIA POSTS
// ==========================================

router.get("/admin/all", getAllMediaPosts);

// ==========================================
// ADMIN
// CREATE MEDIA POST
// Multiple Images + Videos
// ==========================================

router.post(
  "/admin/create",
  upload.array("media", 20),
  createMediaPost
);

// ==========================================
// ADMIN
// DELETE MEDIA POST
// ==========================================

router.delete(
  "/admin/:id",
  deleteMediaPost
);

module.exports = router;