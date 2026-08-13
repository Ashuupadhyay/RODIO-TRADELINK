// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middlewhere/auth"); // आपका authentication middleware

// UPI ID अपडेट करने का Route
router.put("/update-upi", auth, userController.updateUpiId);

module.exports = router;