const express = require("express");
const router = express.Router();
const protect=require("../middlewhere/protectAPi");

const auth = require("../middlewhere/auth");
const { getDashboard } = require("../controllers/dashboardController");

router.get("/dashboard",protect, auth, getDashboard);

module.exports = router;