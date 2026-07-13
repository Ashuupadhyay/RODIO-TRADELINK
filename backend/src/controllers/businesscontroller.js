const Business = require("../models/business");
const { customAlphabet } = require("nanoid");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudnary");

const nanoid = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  4
);

const createBusiness = async (req, res) => {
  try {
    const {
      category,
      from,
      to,
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
    } = req.body;
 console.log("Category:", category);
    console.log("From:", from);
    console.log("To:", to);
    console.log("Firm Name:", firmName);
    console.log("Owner Name:", ownerName);
    console.log("Address:", address);
    console.log("Current City:", currentCity);
    console.log("Current State:", currentState);
    console.log("Pincode:", pincode);
    console.log("Phone Number:", phoneNumber);
    console.log("Alternate Phone:", alternatePhone);
    console.log("Email:", email);
    console.log("Website:", website);
    let { vehicleTypes, acceptedTerms } = req.body;

    // form-data me boolean string hota hai
    acceptedTerms = acceptedTerms === "true" || acceptedTerms === true;

    // vehicleTypes array bana do
    if (typeof vehicleTypes === "string") {
      vehicleTypes = vehicleTypes.split(",");
    }

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
        message: "Please fill all required fields."
      });
    }
 console.log("dhdhdhdkbdkbkb");
    const mobileExists = await Business.findOne({ phoneNumber });

    if (mobileExists) {
      return res.status(400).json({
        success: false,
        message: "Phone Number already exists."
      });
    }

    const emailExists = await Business.findOne({
      email: email.toLowerCase()
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists."
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

      email: email.toLowerCase(),
      website,
      socialMedia,

      businessId,
      referralCode,
      referredBy,

      photo: req.files?.photo?.[0]
        ? {
            public_id: req.files.photo[0].filename,
            url: req.files.photo[0].path,
          }
        : {},

      aadhaar: req.files?.aadhaar?.[0]
        ? {
            public_id: req.files.aadhaar[0].filename,
            url: req.files.aadhaar[0].path,
          }
        : {},

      panCard: req.files?.panCard?.[0]
        ? {
            public_id: req.files.panCard[0].filename,
            url: req.files.panCard[0].path,
          }
        : {},

      gumasta: req.files?.gumasta?.[0]
        ? {
            public_id: req.files.gumasta[0].filename,
            url: req.files.gumasta[0].path,
          }
        : {},

      gstCertificate: req.files?.gstCertificate?.[0]
        ? {
            public_id: req.files.gstCertificate[0].filename,
            url: req.files.gstCertificate[0].path,
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




//get






const searchBusiness = async (req, res) => {
  try {
    const { from, to, vehicleType } = req.query;
    console.log("aarha h ");
    console.log(from);
    console.log(to);
    console.log(vehicleType);

    let query = {};

    if (from) {
      query.from = from;
    }

    if (to) {
      query.to = to;
    }

    if (vehicleType) {
      const vehicles = vehicleType.split(",");
      query.vehicleTypes = { $in: vehicles };
    }

    const businesses = await Business.find(query);

    res.status(200).json({
      success: true,
      total: businesses.length,
      data: businesses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createBusiness,
  searchBusiness
};