const express = require("express");

const router = express.Router();

const {
  saveBusiness,
  getMyBusiness,
  getDashboard,
  getPublicBusiness,
} = require("../controllers/business");

const authMiddleware = require("../middlewhere/auth");

// PRIVATE

router.post(
  "/create",
  authMiddleware,
  saveBusiness
);

router.patch(
  "/update",
  authMiddleware,
  saveBusiness
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