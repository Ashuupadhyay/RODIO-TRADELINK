const express = require("express");
const router = express.Router();

// Middleware (Aapke project ke spelling/path ke according)
const auth = require("../middlewhere/auth");
const upload = require("../middlewhere/multer");

// Controllers
const {
  createStepOneBusiness,
  verifyPayment,
  updateRemainingBusinessDetails,
  searchBusiness,
  getAllBusiness,
} = require("../controllers/oldbusiness");

// ==========================================
// 🔴 BUSINESS REGISTRATION FLOW (2-STEP)
// ==========================================

// Step 1: Basic details submit karna (Before Payment)
router.post(
  "/create-step-one",
  auth,
  createStepOneBusiness
);

// Payment verify karna (Step 1 ke baad)
router.post(
  "/verify-payment",
  auth,
  verifyPayment
);

// Step 2: Documents + Remaining details submit karna (After Payment)
router.put(
  "/update-step-two/:businessId",
  auth,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadhaar", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "gumasta", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
  ]),
  updateRemainingBusinessDetails
);

// ==========================================
// 🔵 FETCH & SEARCH ROUTES
// ==========================================

// Sabhi active businesses fetch karna
router.get("/business", getAllBusiness);

// Business search filter karna
router.get("/search", searchBusiness);

module.exports = router;