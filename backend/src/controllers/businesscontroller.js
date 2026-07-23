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
    ) {
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