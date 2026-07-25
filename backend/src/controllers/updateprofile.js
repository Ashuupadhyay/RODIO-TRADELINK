const Business = require("../models/business");

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("Logged in User ID:", userId);

    // Current user ka business find karo
    let business = await Business.findOne({ user: userId });

    // Agar business nahi hai to create karo
    if (!business) {
      business = new Business({
        user: userId,
      });
    }

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

    // Sirf request me aaye fields update honge
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
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};