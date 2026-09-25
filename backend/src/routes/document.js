 const express = require("express");
 const protect=require("../middlewhere/protectAPi");

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
  protect,
  authMiddleware,
  upload.single("document"),
  uploadDocument
);

// My Documents
router.get(
  "/my",
  protect,
  authMiddleware,
  getMyDocuments
);

// Delete
router.delete(
  "/:id",
  protect,
  authMiddleware,
  deleteDocument
);

module.exports = router;