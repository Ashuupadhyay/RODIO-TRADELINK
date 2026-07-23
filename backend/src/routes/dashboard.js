const express = require("express");
const router = express.Router();

const auth = require("../middlewhere/auth");
const { getDashboard } = require("../controllers/dashboardController");

router.get("/dashboard", auth, getDashboard);

module.exports = router;