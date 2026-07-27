 const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middlewhere/auth");

// Apne existing multer/cloudinary middleware
// ka correct path yahan lagana
const upload =
  require("../middlewhere/multer");

const {
  uploadDocument,
  getMyDocuments,
  deleteDocument,
} = require("../controllers/documentscontroller.js");

// Upload
router.post(
  "/upload",
  authMiddleware,
  upload.single("document"),
  uploadDocument
);

// My Documents
router.get(
  "/my",
  authMiddleware,
  getMyDocuments
);

// Delete
router.delete(
  "/:id",
  authMiddleware,
  deleteDocument
);

module.exports = router;