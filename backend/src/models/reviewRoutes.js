const express = require("express");

const router = express.Router();

const {
  addReview,
  getAllReviews,
  editReview,
  deleteReview,
} = require("../controllers/reviewController");

const authMiddleware = require("../middleware/auth");
//const adminMiddleware = require("../middleware/adminMiddleware");

// ==========================================
// USER → ADD REVIEW
// POST /api/reviews
// ==========================================

router.post(
  "/",
  authMiddleware,
  addReview
);


// ==========================================
// HOME PAGE + ADMIN → GET ALL REVIEWS
// GET /api/reviews
// ==========================================

router.get(
  "/",
  getAllReviews
);


// ==========================================
// ADMIN → EDIT REVIEW
// PUT /api/reviews/:reviewId
// ==========================================

router.put(
  "/:reviewId",
 
  editReview
);


// ==========================================
// ADMIN → DELETE REVIEW
// DELETE /api/reviews/:reviewId
// ==========================================

router.delete(
  "/:reviewId",

  deleteReview
);


module.exports = router;