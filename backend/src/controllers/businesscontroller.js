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
      workingAreas,
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
      acceptedTerms,
      paymentId,
      orderId
    } = req.body;

    // ---------- Normalize & Data Parsing ----------

    category = category?.trim();
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

    // Parse workingAreas if received as stringified JSON from FormData
    if (workingAreas && typeof workingAreas === "string") {
      try {
        workingAreas = JSON.parse(workingAreas);
      } catch (err) {
        workingAreas = [];
      }
    }

    if (Array.isArray(workingAreas)) {
      workingAreas = workingAreas.map((area) => ({
        state: area.state?.trim().toLowerCase() || "",
        cities: Array.isArray(area.cities)
          ? area.cities.map((city) => city.trim().toLowerCase())
          : [],
      }));
    } else {
      workingAreas = [];
    }

    // Convert acceptedTerms boolean or string to boolean
    acceptedTerms =
      acceptedTerms === true ||
      acceptedTerms === "true";

    // Normalize vehicleTypes array
    if (typeof vehicleTypes === "string") {
      vehicleTypes = vehicleTypes.split(",").map((v) => v.trim());
    } else if (Array.isArray(vehicleTypes)) {
      vehicleTypes = vehicleTypes.map((v) => (typeof v === "string" ? v.trim() : v));
    } else {
      vehicleTypes = [];
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
      !acceptedTerms ||
      !workingAreas ||
      workingAreas.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // ---------- Duplicate Checks ----------

    const mobileExists = await Business.findOne({ phoneNumber });
    if (mobileExists) {
      return res.status(400).json({
        success: false,
        message: "Phone Number already exists",
      });
    }

    const emailExists = await Business.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Generate Business Identifiers
    const businessId = "RDL" + Date.now();
    const referralCode = nanoid();

    // ---------- Create Business Document ----------

    const business = await Business.create({
      user: req.user.id,
      category,
      workingAreas,
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
      paymentId,
      orderId,

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

      acceptedTerms,
    });

    return res.status(201).json({
      success: true,
      message: "Business Registered Successfully",
      business,
    });
  } catch (error) {
    console.error("Create Business Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================= SEARCH BUSINESS =======================

const searchBusiness = async (req, res) => {
  try {
    const {
      category,
      state,
      city,
      currentState,
      currentCity,
      vehicleType,
    } = req.query;

    const query = {};

    if (category) {
      query.category = {
        $regex: new RegExp("^" + category.trim() + "$", "i"),
      };
    }

    if (currentState) {
      query.currentState = {
        $regex: new RegExp("^" + currentState.trim() + "$", "i"),
      };
    }

    if (currentCity) {
      query.currentCity = {
        $regex: new RegExp("^" + currentCity.trim() + "$", "i"),
      };
    }

    if (state) {
      query["workingAreas.state"] = {
        $regex: new RegExp("^" + state.trim() + "$", "i"),
      };
    }

    if (city) {
      query["workingAreas.cities"] = {
        $regex: new RegExp("^" + city.trim() + "$", "i"),
      };
    }

    if (vehicleType) {
      const vehicles = vehicleType
        .split(",")
        .map((v) => new RegExp("^" + v.trim() + "$", "i"));

      query.vehicleTypes = {
        $in: vehicles,
      };
    }

    const businesses = await Business.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ firmName: 1 });

    return res.status(200).json({
      success: true,
      total: businesses.length,
      data: businesses,
    });
  } catch (error) {
    console.error("Search Business Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================= GET ALL BUSINESSES =======================

const getAllBusiness = async (req, res) => {
  try {
    const businesses = await Business.find();

    return res.status(200).json({
      success: true,
      data: businesses,
    });
  } catch (error) {
    console.error("Get All Business Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

module.exports = {
  createBusiness,
  searchBusiness,
  getAllBusiness,
};