const express = require("express");
const router = express.Router();

const { exportExcel } = require("../controllers/excel");

router.get("/export", exportExcel);

module.exports = router;