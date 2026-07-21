const express = require("express");
const router = express.Router();

const { createOrder,verifyPayment } = require("../controllers/paymentcontroller");
const auth = require("../middlewhere/auth");
// Create Order API
router.post("/create-order", createOrder);
router.post("/verify-payment", auth, verifyPayment);

module.exports = router;
