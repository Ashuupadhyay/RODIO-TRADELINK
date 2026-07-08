const express = require("express");
const router = express.Router();

const { searchBusiness } = require("../controllers/vichletype");

router.get("/vsearch", searchBusiness);

module.exports = router;