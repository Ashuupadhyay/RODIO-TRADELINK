

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
    console.log("workingAreas:", workingAreas);
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

    // Agar poora body dekhna ho
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

    // Parse workingAreas if stringified JSON
    if (workingAreas && typeof workingAreas === "string") {
      try {
        workingAreas = JSON.parse(workingAreas);
      } catch (err) {
        workingAreas = [];
      }
    }

    // Process & Filter workingAreas to prevent empty state error
    if (Array.isArray(workingAreas)) {
      workingAreas = workingAreas
        .map((area) => {
          const state = area.state ? area.state.trim().toLowerCase() : undefined;
          const cities = Array.isArray(area.cities)
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
    ){
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
/*
    if (from) {
      query.from = {
        $regex: new RegExp("^" + from.trim() + "$", "i")
      };
    }

    if (to) {
      query.to = {
        $regex: new RegExp("^" + to.trim() + "$", "i")
      };
    }*/

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


// ======================= SAVE / UPDATE DRAFT =======================
/*

const saveDraft = async (req, res) => {
  try {
    const userId = req.user.id;

    const formData = req.body;

    let draft = await Business.findOne({
      user: userId,
      status: "Draft",
    });

    if (draft) {
      Object.assign(draft, formData);
      draft.status = "Draft";

      await draft.save();

      return res.status(200).json({
        success: true,
        message: "Draft Updated Successfully",
        business: draft,
      });
    }

    draft = await Business.create({
      ...formData,
      user: userId,
      status: "Draft",
    });

    return res.status(201).json({
      success: true,
      message: "Draft Saved Successfully",
      business: draft,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================= GET DRAFT =======================

const getDraft = async (req, res) => {
  try {

    const draft = await Business.findOne({
      user: req.user.id,
      status: "Draft",
    });

    return res.status(200).json({
      success: true,
      business: draft,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================= DELETE DRAFT =======================

const deleteDraft = async (req, res) => {
  try {

    await Business.findOneAndDelete({
      user: req.user.id,
      status: "Draft",
    });

    return res.status(200).json({
      success: true,
      message: "Draft Deleted Successfully",
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
const activateBusiness = async (req, res) => {
  try {

    const business = await Business.findOne({
      user: req.user.id,
      status: "Draft",
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Draft Business Not Found",
      });
    }

    // Duplicate Check
    const mobileExists = await Business.findOne({
      phoneNumber: business.phoneNumber,
      status: "Active",
      _id: { $ne: business._id },
    });

    if (mobileExists) {
      return res.status(400).json({
        success: false,
        message: "Phone Number Already Registered",
      });
    }

    const emailExists = await Business.findOne({
      email: business.email,
      status: "Active",
      _id: { $ne: business._id },
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email Already Registered",
      });
    }

    // Generate IDs
    business.businessId = "RDL" + Date.now();
    business.referralCode = nanoid();

    business.profileCompleted = true;
    business.status = "Active";

    await business.save();

    return res.status(200).json({
      success: true,
      message: "Business Activated Successfully",
      business,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};*/
module.exports = {
  createBusiness,
  searchBusiness,
  getAllBusiness/*
    saveDraft,
  getDraft,
  deleteDraft,
   activateBusiness,*/
};