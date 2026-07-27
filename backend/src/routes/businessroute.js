const express = require("express");
const router = express.Router();

const {
  saveBusinessDraft,
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

module.exports = router;