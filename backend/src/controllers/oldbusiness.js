const Business = require("../models/business");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 4);

// ======================= 1. STEP ONE: CREATE DRAFT BUSINESS =======================
const createStepOneBusiness = async (req, res) => {
  try {
    let {
      category,
      firmName,
      ownerName,
      address,
      currentCity,
      currentState,
      pincode,
      email,
    } = req.body;

    // Normalization
    category = category?.trim();
    firmName = firmName?.trim();
    ownerName = ownerName?.trim();
    address = address?.trim();
    currentCity = currentCity?.trim().toLowerCase();
    currentState = currentState?.trim().toLowerCase();
    email = email?.trim().toLowerCase();

    // Step-1 Validation Check
    if (
      !category ||
      !firmName ||
      !ownerName ||
      !address ||
      !currentCity ||
      !currentState ||
      !pincode ||
      !email
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required Step-1 fields.",
      });
    }

    // Check if email already registered in another business
    const emailExists = await Business.findOne({ email });
    if (emailExists && emailExists.user.toString() !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Email already exists with another business account",
      });
    }

    // Unique Identifier Generation
    const businessId = "RDL" + Date.now();
    const referralCode = nanoid();

    // Create or Update Draft
    let business = await Business.findOne({ user: req.user.id });

    if (!business) {
      business = new Business({
        user: req.user.id,
        category,
        firmName,
        ownerName,
        address,
        currentCity,
        currentState,
        pincode,
        email,
        businessId,
        referralCode,
        status: "Payment_Pending",
        isPaymentCompleted: false,
      });
    } else {
      // Direct update if draft exists
      business.category = category;
      business.firmName = firmName;
      business.ownerName = ownerName;
      business.address = address;
      business.currentCity = currentCity;
      business.currentState = currentState;
      business.pincode = pincode;
      business.email = email;
    }

    await business.save();

    return res.status(200).json({
      success: true,
      message: "Step-1 details saved. Please proceed to payment.",
      businessId: business._id,
      business,
    });
  } catch (error) {
    console.error("Step-1 Creation Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================= 2. VERIFY PAYMENT =======================
const verifyPayment = async (req, res) => {
  try {
    const { businessId, paymentId, orderId, amount } = req.body;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business record not found",
      });
    }

    business.isPaymentCompleted = true;
    business.status = "Active";
    business.paymentDetails = {
      transactionId: paymentId,
      orderId: orderId,
      amount: amount,
      paidAt: new Date(),
    };

    await business.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully. Now complete your remaining details.",
      businessId: business._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Payment Verification Error",
    });
  }
};

// ======================= 3. STEP TWO: UPDATE REMAINING DETAILS =======================
const updateRemainingBusinessDetails = async (req, res) => {
  try {
    const { businessId } = req.params;
    let {
      phoneNumber,
      alternatePhone,
      website,
      socialMedia,
      workingAreas,
      vehicleTypes,
      acceptedTerms,
      referredBy,
    } = req.body;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Payment validation check
    if (!business.isPaymentCompleted) {
      return res.status(403).json({
        success: false,
        message: "Payment is pending. Please complete payment first.",
      });
    }

    // Duplicate Phone Check
    if (phoneNumber) {
      phoneNumber = phoneNumber.trim();
      const phoneExists = await Business.findOne({
        phoneNumber,
        _id: { $ne: businessId },
      });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: "Phone Number is already registered with another business",
        });
      }
      business.phoneNumber = phoneNumber;
    }

    // Parse Working Areas
    let parsedWorkingAreas = [];
    if (workingAreas) {
      if (Array.isArray(workingAreas)) {
        parsedWorkingAreas = workingAreas
          .map((item) => (typeof item === "string" ? JSON.parse(item) : item))
          .filter(Boolean);
      } else if (typeof workingAreas === "string") {
        try {
          const parsed = JSON.parse(workingAreas);
          parsedWorkingAreas = Array.isArray(parsed) ? parsed : [parsed];
        } catch (err) {
          parsedWorkingAreas = [];
        }
      }
    }

    if (Array.isArray(parsedWorkingAreas)) {
      business.workingAreas = parsedWorkingAreas
        .map((area) => ({
          state: area?.state ? String(area.state).trim().toLowerCase() : undefined,
          cities: Array.isArray(area?.cities)
            ? area.cities.map((city) => String(city).trim().toLowerCase()).filter(Boolean)
            : [],
        }))
        .filter((area) => Boolean(area.state));
    }

    // Parse Vehicle Types
    if (typeof vehicleTypes === "string") {
      business.vehicleTypes = vehicleTypes.split(",").map((v) => v.trim()).filter(Boolean);
    } else if (Array.isArray(vehicleTypes)) {
      business.vehicleTypes = vehicleTypes.map((v) => (typeof v === "string" ? v.trim() : v)).filter(Boolean);
    }

    // Files / Documents Handling (Multer)
    if (req.files) {
      if (req.files.photo?.[0]) {
        business.photo = {
          public_id: req.files.photo[0].filename,
          url: req.files.photo[0].path,
        };
      }
      if (req.files.aadhaar?.[0]) {
        business.aadhaar = {
          public_id: req.files.aadhaar[0].filename,
          url: req.files.aadhaar[0].path,
        };
      }
      if (req.files.panCard?.[0]) {
        business.panCard = {
          public_id: req.files.panCard[0].filename,
          url: req.files.panCard[0].path,
        };
      }
      if (req.files.gumasta?.[0]) {
        business.gumasta = {
          public_id: req.files.gumasta[0].filename,
          url: req.files.gumasta[0].path,
        };
      }
      if (req.files.gstCertificate?.[0]) {
        business.gstCertificate = {
          public_id: req.files.gstCertificate[0].filename,
          url: req.files.gstCertificate[0].path,
        };
      }
    }

    // Text details update
    if (alternatePhone) business.alternatePhone = alternatePhone.trim();
    if (website) business.website = website.trim();
    if (socialMedia) business.socialMedia = socialMedia.trim();
    if (referredBy) business.referredBy = referredBy;
    if (acceptedTerms !== undefined) {
      business.acceptedTerms = acceptedTerms === true || acceptedTerms === "true";
    }

    business.profileCompleted = true;
    await business.save();

    return res.status(200).json({
      success: true,
      message: "Business details updated successfully!",
      business,
    });
  } catch (error) {
    console.error("Update Business Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================= SEARCH BUSINESS =======================
const searchBusiness = async (req, res) => {
  try {
    let { category, state, city, currentState, currentCity, vehicleType } = req.query;

    let query = { status: "Active" }; // Search me sirf paid/active businesses dikhein

    if (category) {
      query.category = { $regex: new RegExp("^" + category.trim() + "$", "i") };
    }
    if (currentState) {
      query.currentState = { $regex: new RegExp("^" + currentState.trim() + "$", "i") };
    }
    if (currentCity) {
      query.currentCity = { $regex: new RegExp("^" + currentCity.trim() + "$", "i") };
    }
    if (state) {
      query["workingAreas.state"] = { $regex: new RegExp("^" + state.trim() + "$", "i") };
    }
    if (city) {
      query["workingAreas.cities"] = { $regex: new RegExp("^" + city.trim() + "$", "i") };
    }
    if (vehicleType) {
      const vehicles = vehicleType.split(",").map((v) => new RegExp("^" + v.trim() + "$", "i"));
      query.vehicleTypes = { $in: vehicles };
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
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================= GET ALL BUSINESS =======================
const getAllBusiness = async (req, res) => {
  try {
    const businesses = await Business.find();

    res.status(200).json({
      success: true,
      data: businesses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Module Exports
module.exports = {
  createStepOneBusiness,
  verifyPayment,
  updateRemainingBusinessDetails,
  searchBusiness,
  getAllBusiness,
};