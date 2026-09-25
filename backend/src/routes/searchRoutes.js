const express = require("express");
const protect=require("../middlewhere/protectAPi");

const router = express.Router();

const {
  searchBusinesses,
  searchBusinessesByField,
} = require("../controllers/searchController");

// Existing API
router.get("/search", protect,searchBusinesses);

// New API - Firm Name / Owner Name / Number search
router.get("/search-by",protect, searchBusinessesByField);

module.exports = router;