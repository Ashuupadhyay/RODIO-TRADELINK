// routes/payoutRoutes.js

const express = require("express");
const router = express.Router();

const payoutController = require("../controllers/payoutController");
const auth = require("../middlewhere/auth");

// Admin Referral Dashboard
router.get(
  "/admin-referrals",
  auth,
  payoutController.getAdminReferralDashboard
);

// Mark single referral payment as successful
router.post(
  "/mark-payment-success",
  auth,
  payoutController.markPaymentSuccess
);

module.exports = router;