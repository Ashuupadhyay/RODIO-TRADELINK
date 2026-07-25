const Business = require("../models/business");

exports.updateProfile = async (req, res) => {
  try {
    const business = await Business.findOne({ user: req.user.id });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found",
      });
    }

    // Allowed fields only
    const allowedFields = [
      "category",
      "workingAreas",
      "firmName",
      "vehicleTypes",
      "ownerName",
      "address",
      "currentCity",
      "currentState",
      "pincode",
      "phoneNumber",
      "alternatePhone",
      "email",
      "website",
      "socialMedia",
      "acceptedTerms",
      "profileCompleted",
      "referredBy",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        business[field] = req.body[field];
      }
    });

    // Photo update
    if (req.file) {
      business.photo = {
        public_id: req.file.filename,
        url: req.file.path,
      };
    }

    await business.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: business,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};