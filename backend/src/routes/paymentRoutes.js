const express = require("express");
const router = express.Router();

const { createOrder,verifyPayment,getReceipt,getReferralStats} = require("../controllers/paymentcontroller");
const auth = require("../middlewhere/auth");
// Create Order API
router.post("/create-order", auth,createOrder);
router.post("/verify-payment", auth, verifyPayment);
router.get("/receipt/:paymentId", auth, getReceipt);
router.get("/referral/stats", auth, getReferralStats);

module.exports = router;
