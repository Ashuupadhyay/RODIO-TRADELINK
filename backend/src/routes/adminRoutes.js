// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
// const authAdmin = require("../middleware/authAdmin"); // आपका Admin Middleware

// GET: सभी रेफरल और UPI की लिस्ट देखें
router.get("/referral-payouts", adminController.getAllReferralPayouts);

// POST: मैन्युअल पेमेंट के बाद स्टेटस बदलना
router.post("/mark-paid", adminController.markPayoutAsPaid);

module.exports = router;