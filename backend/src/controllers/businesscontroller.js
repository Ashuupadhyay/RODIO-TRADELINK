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
    console.log("========== CREATE BUSINESS REQUEST ==========");
    console.log("category:", category);
    console.log("workingAreas raw:", workingAreas);
    console.log("vehicleTypes:", vehicleTypes);
    console.log("firmName:", firmName);
    console.log("ownerName:", ownerName);
    console.log("address:", address);
    console.log("currentCity:", currentCity);
    console.log("currentState:", currentState);
    console.log("pincode:", pincode);
    console.log("phoneNumber:", phoneNumber);
    console.log("alternatePhone:", alternatePhone);
    console.log("email:", email);
    console.log("website:", website);
    console.log("socialMedia:", socialMedia);
    console.log("referredBy:", referredBy);
    console.log("acceptedTerms:", acceptedTerms);
    console.log("paymentId:", paymentId);
    console.log("orderId:", orderId);
    console.log("req.body:", req.body);
    console.log("============================================");

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

    // ---------- UPDATED WORKING AREAS PARSING LOGIC ----------
    let parsedWorkingAreas = [];

    if (workingAreas) {
      if (Array.isArray(workingAreas)) {
        // Agar array hai jisme JSON strings hain, unko parse karo
        parsedWorkingAreas = workingAreas.map((item) => {
          if (typeof item === "string") {
            try {
              return JSON.parse(item);
            } catch (e) {
              return null;
            }
          }
          return item;
        }).filter(Boolean);
      } else if (typeof workingAreas === "string") {
        try {
          const parsed = JSON.parse(workingAreas);
          parsedWorkingAreas = Array.isArray(parsed) ? parsed : [parsed];
        } catch (err) {
          parsedWorkingAreas = [];
        }
      }
    }

    // Process & Filter workingAreas to prevent empty state error
    if (Array.isArray(parsedWorkingAreas)) {
      workingAreas = parsedWorkingAreas
        .map((area) => {
          const state = area && area.state ? String(area.state).trim().toLowerCase() : undefined;
          const cities = Array.isArray(area?.cities)
            ? area.cities
                .map((city) => (typeof city === "string" ? city.trim().toLowerCase() : ""))
                .filter((city) => city !== "")
            : [];

          return { state, cities };
        })
        .filter((area) => Boolean(area.state)); // Remove empty state entries
    } else {
      workingAreas = [];
    }

    // Convert acceptedTerms to boolean
    acceptedTerms = acceptedTerms === true || acceptedTerms === "true";

    // Normalize vehicleTypes array
    if (typeof vehicleTypes === "string") {
      vehicleTypes = vehicleTypes.split(",").map((v) => v.trim()).filter(Boolean);
    } else if (Array.isArray(vehicleTypes)) {
      vehicleTypes = vehicleTypes.map((v) => (typeof v === "string" ? v.trim() : v)).filter(Boolean);
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
      console.log("========== VALIDATION DEBUG ==========");
      console.log("category:", category, "=>", !category);
      console.log("ownerName:", ownerName, "=>", !ownerName);
      console.log("address:", address, "=>", !address);
      console.log("currentCity:", currentCity, "=>", !currentCity);
      console.log("currentState:", currentState, "=>", !currentState);
      console.log("pincode:", pincode, "=>", !pincode);
      console.log("phoneNumber:", phoneNumber, "=>", !phoneNumber);
      console.log("email:", email, "=>", !email);
      console.log("acceptedTerms:", acceptedTerms, "=>", !acceptedTerms);
      console.log("workingAreas:", workingAreas);
      console.log("workingAreas isArray:", Array.isArray(workingAreas));
      console.log("workingAreas length:", workingAreas?.length);
      console.log("workingAreas invalid:", !workingAreas || workingAreas.length === 0);
      console.log("======================================");

      return res.status(400).json({
        success: false,
        message: "Please fill all required fields (including valid working areas)",
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

    // Generate Identifiers
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
    let {
      category,
      state,
      city,
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

// ======================= GET ALL BUSINESS =======================

const getAllBusiness = async (req, res) => {
  try {
    const businesses = await Business.find();

    res.status(200).json({
      success: true,
      data: businesses
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createBusiness,
  searchBusiness,
  getAllBusiness
};