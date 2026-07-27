const express = require("express");

const router = express.Router();

const authMiddleware = require(
  "../middlewhere/auth"
);

const requireActiveSubscription = require(
  "../middlewhere/businessmiddle.js"
);

const {
  createRoute,
  getMyRoutes,
  updateRoute,
  deleteRoute,
} = require("../controllers/routecontroller.js");

router.use(authMiddleware);
router.use(requireActiveSubscription);

router.post("/", createRoute);

router.get("/my", getMyRoutes);

router.patch("/:id", updateRoute);

router.delete("/:id", deleteRoute);

module.exports = router;