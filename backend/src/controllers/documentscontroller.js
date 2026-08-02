const cloudinary = require("../config/cloudnary");
const streamifier = require("streamifier");

const BusinessDocument =
  require("../models/documents.js");

const Business =
  require("../models/business");

// ======





exports.uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id;

    const business = await Business.findOne({
      user: userId,
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (
      business.subscriptionStatus !== "active" ||
      business.profileUnlocked !== true
    ) {
      return res.status(403).json({
        success: false,
        message: "Complete payment to upload documents",
      });
    }

    const { documentType, documentName } = req.body;

    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: "Document type is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Document file is required",
      });
    }

    console.log("========== FILE ==========");
    console.log(req.file);
    console.log("==========================");

    // Upload buffer to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "business-documents",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    console.log("Cloudinary Result:", uploadResult);

    const document = await BusinessDocument.create({
      business: business._id,
      user: userId,

      documentType,
      documentName: documentName || documentType,

      documentUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,

      verificationStatus: "pending",
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: document,
    });
  } catch (error) {
    console.error("UPLOAD DOCUMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
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
      message: "We couldn't process your request at the moment. Please try again later. If the problem continues, contact our support team.",
    });
  }
};