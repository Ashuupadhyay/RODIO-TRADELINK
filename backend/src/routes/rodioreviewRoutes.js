const express = require("express");
const router = express.Router();
const {
  addOrUpdateReview,
  getAllReviews,
  getMyReview,
  deleteMyReview,
} = require("../controllers/rodioreviewController");

// AAPKA AUTH MIDDLEWARE
const auth = require("../middlewhere/auth");


// ==========================================
// PUBLIC
// Saare users reviews dekh sakte hain
// ==========================================

router.get("/", getAllReviews);


// ==========================================
// PRIVATE
// Login required
// ==========================================

// apna existing review
router.get("/my-review", auth, getMyReview);

// add/update
router.post("/", auth, addOrUpdateReview);

// delete
router.delete("/my-review/:id", auth, deleteMyReview);


module.exports = router;