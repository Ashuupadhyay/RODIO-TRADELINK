const express = require("express");
const protect=require("../middlewhere/protectAPi");
const router = express.Router();
const { searchVehicles } = require("../controllers/vehicleSearchController");

// Search Route Definition
router.get("/search",protect, searchVehicles);

module.exports = router;