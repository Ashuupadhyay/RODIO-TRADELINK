const express = require("express");

const router = express.Router();

const {
  bulkCreateDirectoryLeads,
  getDirectoryLeads,
  deleteDirectoryLead,
} = require("../controllers/directoryLeadController");


// Bulk dummy data
router.post(
  "/bulk",
  bulkCreateDirectoryLeads
);


// Get all leads
router.get(
  "/",
  getDirectoryLeads
);


// Delete/deactivate dummy
router.delete(
  "/:id",
  deleteDirectoryLead
);


module.exports = router;