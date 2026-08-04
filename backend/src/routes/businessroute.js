const express = require("express");
const router = express.Router();

const {
  saveBusinessDraft,
  updateDashboardBusinessDetails,
  getMyBusiness,
  getDashboard,
  getPublicBusiness,
} = require("../controllers/business");

const authMiddleware = require("../middlewhere/auth");

// PRIVATE

router.post(
  "/create",
  authMiddleware,
  saveBusinessDraft
);

router.patch(
  "/update",
  authMiddleware,
  saveBusinessDraft
);

router.get(
  "/me",
  authMiddleware,
  getMyBusiness
);

router.get(
  "/dashboard",
  authMiddleware,
  getDashboard
);

// PUBLIC

router.get(
  "/public/:id",
  getPublicBusiness
);

router.patch(
  "/update-details",
  authMiddleware,
  updateDashboardBusinessDetails
);

module.exports = router;