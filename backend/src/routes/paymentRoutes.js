const express = require("express");
const router = express.Router();

const { createOrder } = require("../controllers/paymentcontroller");

// Create Order API
router.post("/create-order", createOrder);

module.exports = router;
