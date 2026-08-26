const express = require("express");

const router = express.Router();

const expireSubscriptions = require("../services/subscriptionExpiry");

// ==========================================
// MANUAL SUBSCRIPTION EXPIRY CHECK
// ==========================================

router.post("/expire-check", async (req, res) => {
  try {
    const result = await expireSubscriptions();

    return res.status(200).json({
      success: true,
      message: "Subscription expiry check completed",
      result,
    });
  } catch (error) {
    console.error("EXPIRY ROUTE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Subscription expiry check failed",
    });
  }
});

module.exports = router;