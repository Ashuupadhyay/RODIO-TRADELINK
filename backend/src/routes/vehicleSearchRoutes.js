const express = require("express");
const router = express.Router();
const { searchVehicles } = require("../controllers/vehicleSearchController");

// Search Route Definition
router.get("/search", searchVehicles);

module.exports = router;