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

router.get(
  "/working-areas",
  auth,
  addWorkingAreas
);

router.delete(
  "/working-areas",
  auth,
  addWorkingAreas
);






module.exports = router;