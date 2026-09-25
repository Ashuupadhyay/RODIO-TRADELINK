const express = require("express");
const router = express.Router();
const protect=require("../middlewhere/protectAPi");

const { searchBusiness } = require("../controllers/vichletype");

router.get("/vsearch", protect,searchBusiness);

module.exports = router;