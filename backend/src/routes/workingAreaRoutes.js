const express = require("express");

const router = express.Router();

const auth = require("../middlewhere/auth");

const {
  addWorkingAreas,
  getMyWorkingAreas,
  deleteWorkingArea,
} = require("../controllers/workingAreaController");

router.put(
  "/working-areas",
  auth,
  addWorkingAreas
);

// GET Working Areas
router.get(
  "/working-areas",
  auth,
  getMyWorkingAreas
);

// DELETE Working Area
router.delete(
  "/working-areas",
  auth,
  deleteWorkingArea
);

module.exports = router;