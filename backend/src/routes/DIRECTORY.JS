const express = require("express");
const router = express.Router();
const protect=require("../middlewhere/protectAPi");

const {
  getDirectory,
} = require("../controllers/DIRECTORY.JS");

router.get("/", protect,getDirectory);

module.exports = router;