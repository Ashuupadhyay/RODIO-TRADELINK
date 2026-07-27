const express = require("express");

const router = express.Router();

const authMiddleware = require(
  "../middlewhere/auth"
);

const requireActiveSubscription = require(
  "../middlewhere/businessmiddle"
);

const {
  createVehicle,
  getMyVehicles,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vechlecontroller.js");

router.use(authMiddleware);
router.use(requireActiveSubscription);

router.post("/", createVehicle);

router.get("/my", getMyVehicles);

router.patch("/:id", updateVehicle);

router.delete("/:id", deleteVehicle);

module.exports = router;