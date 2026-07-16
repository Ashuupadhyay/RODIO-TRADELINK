const express = require("express");
const router = express.Router();

const {
  getTransporterById,
} = require("../controllers/transportController");

router.get("/:id", getTransporterById);

module.exports = router;