const Business = require("../models/business");
const BusinessDocument = require("../models/documents");

// ======================================================
// GET ALL USERS WITH THEIR DOCUMENTS
// ======================================================

exports.getUsersWithDocuments = async (req, res) => {
  try {
    const businesses = await Business.find({
      isActive: true,
    })
      .populate("user", "mobile")
      .sort({ createdAt: -1 });

    const data = await Promise.all(
      businesses.map(async (business) => {
        const documents = await BusinessDocument.find({
          business: business._id,
          isActive: true,
        }).sort({ createdAt: -1 });

        return {
          userId: business.user?._id || null,
          businessId: business._id,

          name:
            business.name ||
            business.firmName ||
            "N/A",

          firmName: business.firmName || "",
          email: business.email || "",

          mobile:
            business.phoneNumber ||
            business.user?.mobile ||
            "",

          isVerified: business.isVerified || false,
          verifiedAt: business.verifiedAt || null,

          documents,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("GET USERS WITH DOCUMENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch users and documents",
    });
  }
};

// ======================================================
// VERIFY BUSINESS
// ======================================================

exports.verifyBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    business.isVerified = true;
    business.isActive = true;
    business.verifiedAt = new Date();

    // Authentication nahi hai, isliye verifiedBy mat set karo
    business.verifiedBy = null;

    await business.save();

    return res.status(200).json({
      success: true,
      message: "Business verified successfully",
      data: {
        businessId: business._id,
        isVerified: business.isVerified,
        verifiedAt: business.verifiedAt,
      },
    });
  } catch (error) {
    console.error("VERIFY BUSINESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify business",
      error: error.message,
    });
  }
};

// ======================================================
// REMOVE BUSINESS VERIFICATION
// ======================================================

exports.unverifyBusiness = async (req, res) => {
  try {
    const business = await Business.findById(
      req.params.businessId
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Card directory me rahega,
    // sirf verification badge remove hoga.
    business.isVerified = false;
    business.isActive = true;
    business.verifiedAt = null;
    business.verifiedBy = null;

    await business.save();

    return res.status(200).json({
      success: true,
      message: "Business verification removed",
    });
  } catch (error) {
    console.error("UNVERIFY BUSINESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove verification",
    });
  }
};