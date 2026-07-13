

const Business = require("../models/business");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  4
);

// ======================= CREATE BUSINESS =======================

const createBusiness = async (req, res) => {
  try {
    let {
      category,
      from,
      to,
      vehicleTypes,
      firmName,
      ownerName,
      address,
      currentCity,
      currentState,
      pincode,
      phoneNumber,
      alternatePhone,
      email,
      website,
      socialMedia,
      referredBy,
      acceptedTerms
    } = req.body;

    // ---------- Normalize ----------

    category = category?.trim();

    from = from?.trim().toLowerCase();
    to = to?.trim().toLowerCase();

    firmName = firmName?.trim();
    ownerName = ownerName?.trim();

    address = address?.trim();

    currentCity = currentCity?.trim().toLowerCase();
    currentState = currentState?.trim().toLowerCase();

    phoneNumber = phoneNumber?.trim();
    alternatePhone = alternatePhone?.trim();

    email = email?.trim().toLowerCase();

    website = website?.trim();
    socialMedia = socialMedia?.trim();

    acceptedTerms =
      acceptedTerms === true ||
      acceptedTerms === "true";

    // vehicleTypes array

    if (typeof vehicleTypes === "string") {
      vehicleTypes = vehicleTypes.split(",");
    }

    if (Array.isArray(vehicleTypes)) {
      vehicleTypes = vehicleTypes.map(v => v.trim());
    }

    // ---------- Validation ----------

    if (
      !category ||
      !ownerName ||
      !address ||
      !currentCity ||
      !currentState ||
      !pincode ||
      !phoneNumber ||
      !email ||
      !acceptedTerms
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields"
      });
    }

    // ---------- Duplicate ----------

    const mobileExists = await Business.findOne({ phoneNumber });

    if (mobileExists) {
      return res.status(400).json({
        success: false,
        message: "Phone Number already exists"
      });
    }

    const emailExists = await Business.findOne({ email });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    const businessId = "RDL" + Date.now();
    const referralCode = nanoid();

    const business = await Business.create({

      user: req.user.id,

      category,

      from,
      to,

      vehicleTypes,

      firmName,
      ownerName,

      address,
      currentCity,
      currentState,
      pincode,

      phoneNumber,
      alternatePhone,

      email,
      website,
      socialMedia,

      businessId,
      referralCode,
      referredBy,

      photo: req.files?.photo?.[0]
        ? {
            public_id: req.files.photo[0].filename,
            url: req.files.photo[0].path
          }
        : {},

      aadhaar: req.files?.aadhaar?.[0]
        ? {
            public_id: req.files.aadhaar[0].filename,
            url: req.files.aadhaar[0].path
          }
        : {},

      panCard: req.files?.panCard?.[0]
        ? {
            public_id: req.files.panCard[0].filename,
            url: req.files.panCard[0].path
          }
        : {},

      gumasta: req.files?.gumasta?.[0]
        ? {
            public_id: req.files.gumasta[0].filename,
            url: req.files.gumasta[0].path
          }
        : {},

      gstCertificate: req.files?.gstCertificate?.[0]
        ? {
            public_id: req.files.gstCertificate[0].filename,
            url: req.files.gstCertificate[0].path
          }
        : {},

      acceptedTerms

    });

    return res.status(201).json({
      success: true,
      message: "Business Registered Successfully",
      business
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// ======================= SEARCH BUSINESS =======================

const searchBusiness = async (req, res) => {

  try {

    let {
      category,
      from,
      to,
      currentState,
      currentCity,
      vehicleType
    } = req.query;

    let query = {};

    if (category) {
      query.category = {
        $regex: new RegExp("^" + category.trim() + "$", "i")
      };
    }

    if (from) {
      query.from = {
        $regex: new RegExp("^" + from.trim() + "$", "i")
      };
    }

    if (to) {
      query.to = {
        $regex: new RegExp("^" + to.trim() + "$", "i")
      };
    }

    if (currentState) {
      query.currentState = {
        $regex: new RegExp("^" + currentState.trim() + "$", "i")
      };
    }

    if (currentCity) {
      query.currentCity = {
        $regex: new RegExp("^" + currentCity.trim() + "$", "i")
      };
    }

    if (vehicleType) {

      const vehicles = vehicleType
        .split(",")
        .map(v => new RegExp("^" + v.trim() + "$", "i"));

      query.vehicleTypes = {
        $in: vehicles
      };

    }

   const businesses = await Business.find(query)
  .collation({ locale: "en", strength: 2 })
  .sort({ firmName: 1 });

    return res.status(200).json({
      success: true,
      total: businesses.length,
      data: businesses
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

module.exports = {
  createBusiness,
  searchBusiness
};