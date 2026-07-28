const express = require("express");
const router = express.Router();

const {
  getDirectory,
} = require("../controllers/DIRECTORY.JS");

router.get("/", getDirectory);

module.exports = router;