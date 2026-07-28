const express = require("express");
const router = express.Router();

const auth = require("../middlewhere/auth");

const {
  addWorkingAreas,
} = require("../controllers/workingAreaController");

router.put(
  "/working-areas",
  auth,
  addWorkingAreas
);

module.exports = router;