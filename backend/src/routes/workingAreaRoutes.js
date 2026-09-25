const express = require("express");
const protect=require("../middlewhere/protectAPi");

const router = express.Router();

const auth = require("../middlewhere/auth");

const {
  addWorkingAreas,
  getMyWorkingAreas,
  deleteWorkingArea,
} = require("../controllers/workingAreaController");

router.put(
  "/working-areas",
  protect,
  auth,
  addWorkingAreas
);

// GET Working Areas
router.get(
  "/working-areas",
  protect,
  auth,
  getMyWorkingAreas
);

// DELETE Working Area
router.delete(
  "/working-areas",
  protect,
  auth,
  deleteWorkingArea
);

module.exports = router;