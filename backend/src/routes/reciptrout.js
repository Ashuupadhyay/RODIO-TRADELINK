const express = require("express");
const router = express.Router();

const auth = require("../middlewhere/auth");

const {
  getLatestReceipt,
} = require("../controllers/recipt");

router.get("/latest", auth, getLatestReceipt);

module.exports = router;