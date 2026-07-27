const BusinessDocument =
  require("../models/documents.js");

const Business =
  require("../models/business");

// ======================================================
// UPLOAD DOCUMENT
// ======================================================

exports.uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id;

    // --------------------------------------
    // Find Business
    // --------------------------------------

    const business = await Business.findOne({
      user: userId,
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // --------------------------------------
    // Check Subscription
    // --------------------------------------

    if (
      business.subscriptionStatus !== "active" ||
      business.profileUnlocked !== true
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Complete payment to upload documents",
      });
    }

    // --------------------------------------
    // Get Data
    // --------------------------------------

    const {
      documentType,
      documentName,
    } = req.body;

    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: "Document type is required",
      });
    }

    // --------------------------------------
    // Check File
    // --------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Document file is required",
      });
    }

    // Cloudinary + Multer
    const documentUrl =
      req.file.path ||
      req.file.secure_url;

    const publicId =
      req.file.filename ||
      req.file.public_id ||
      "";

    if (!documentUrl) {
      return res.status(400).json({
        success: false,
        message:
          "Document upload URL not found",
      });
    }

    // --------------------------------------
    // Save Document
    // --------------------------------------

    const document =
      await BusinessDocument.create({
        business: business._id,
        user: userId,

        documentType,

        documentName:
          documentName ||
          documentType,

        documentUrl,

        publicId,

        verificationStatus:
          "pending",

        isActive: true,
      });

    return res.status(201).json({
      success: true,
      message:
        "Document uploaded successfully",
      data: document,
    });
  } catch (error) {
    console.error(
      "UPLOAD DOCUMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to upload document",
    });
  }
};

// ======================================================
// GET MY DOCUMENTS
// ======================================================

exports.getMyDocuments = async (req, res) => {
  try {
    const userId = req.user.id;

    const business =
      await Business.findOne({
        user: userId,
      });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const documents =
      await BusinessDocument.find({
        business: business._id,
        isActive: true,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    console.error(
      "GET DOCUMENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to get documents",
    });
  }
};

// ======================================================
// DELETE DOCUMENT
// ======================================================

exports.deleteDocument = async (req, res) => {
  try {
    const userId = req.user.id;

    const business =
      await Business.findOne({
        user: userId,
      });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const document =
      await BusinessDocument.findOne({
        _id: req.params.id,
        business: business._id,
      });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    document.isActive = false;

    await document.save();

    return res.status(200).json({
      success: true,
      message:
        "Document deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE DOCUMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};