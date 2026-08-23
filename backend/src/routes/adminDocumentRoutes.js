const express = require("express");

const router = express.Router();

const {
  getUsersWithDocuments,
  verifyBusiness,
  unverifyBusiness,
} = require("../controllers/adminDocumentController");

// Apne existing middleware ke actual path/name ke according change karo


// ======================================================
// GET USERS + DOCUMENTS
// ======================================================

router.get(
  "/documents/users",
 
  getUsersWithDocuments
);

// ======================================================
// VERIFY BUSINESS
// ======================================================

router.patch(
  "/business/:businessId/verify",
 
  verifyBusiness
);

// ======================================================
// REMOVE VERIFICATION
// ======================================================

router.patch(
  "/business/:businessId/unverify",

  unverifyBusiness
);

module.exports = router;