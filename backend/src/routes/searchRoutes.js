const express = require("express");

const router = express.Router();

const {
  searchBusinesses,
  searchBusinessesByField,
} = require("../controllers/searchController");

// Existing API
router.get("/search", searchBusinesses);

// New API - Firm Name / Owner Name / Number search
router.get("/search-by", searchBusinessesByField);

module.exports = router;