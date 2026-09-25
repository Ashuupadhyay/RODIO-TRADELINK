const express = require("express");
const router = express.Router();

const {
  saveBusinessDraft,
  updateDashboardBusinessDetails,
  getMyBusiness,
  getDashboard,
  getPublicBusiness,
  verifyAllDummyLeads,
unverifyAllDummyLeads,
} = require("../controllers/business");
const protect=require("../middlewhere/protectAPi");
const authMiddleware = require("../middlewhere/auth");

// PRIVATE

router.post(
  "/create",
  protect,
  authMiddleware,
  saveBusinessDraft
);

router.patch(
  "/update",
  protect,
  authMiddleware,
  saveBusinessDraft
);

router.get(
  "/me",
  protect,
  authMiddleware,
  getMyBusiness
);

router.get(
  "/dashboard",
  protect,
  authMiddleware,
  getDashboard
);

// PUBLIC

router.get(
  "/public/:id",
  protect,
  getPublicBusiness
);
router.put("/dummy/verify-all", protect,verifyAllDummyLeads);
router.put("/dummy/unverify-all", protect,unverifyAllDummyLeads);

router.patch(
  "/update-details",
  protect,
  authMiddleware,
  updateDashboardBusinessDetails
);

module.exports = router;