// routes/searchRoutes.js
const express = require("express");
const router = express.Router();
const { searchBusinesses } = require("../controllers/searchController");

router.get("/search", searchBusinesses);

module.exports = router;