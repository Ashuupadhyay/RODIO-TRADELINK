const express = require("express");
const router = express.Router();

const { createOrder,verifyPayment,getReceipt} = require("../controllers/paymentcontroller");
const auth = require("../middlewhere/auth");
// Create Order API
router.post("/create-order", auth,createOrder);
router.post("/verify-payment", auth, verifyPayment);
router.get("/receipt/:paymentId", auth, getReceipt);

module.exports = router;
