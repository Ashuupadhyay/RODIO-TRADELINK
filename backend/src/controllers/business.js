const Business = require("../models/business");
const Vehicle = require("../models/vehicle");
const Route = require("../models/route");
const Subscription = require("../models/suscription");

// ======================================================
// SAVE / UPDATE BUSINESS DRAFT
// Payment se pehle sirf draft save hoga
// ======================================================

exports.saveBusinessDraft = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      firmName,
      address,
      currentCity,
      currentState,
      pincode,
    } = req.body;

    // --------------------------------------
    // Validation
    // --------------------------------------

    if (
      !firmName?.trim() ||
      !address?.trim() ||
      !currentCity?.trim() ||
      !currentState?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All business fields are required",
      });
    }

    if (!/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 6 digit pincode",
      });
    }

    // --------------------------------------
    // Check existing business
    // --------------------------------------

    let business = await Business.findOne({
      user: userId,
    });

    // --------------------------------------
    // Already completed business
    // --------------------------------------

    if (
      business &&
      business.registrationStatus === "completed" &&
      business.subscriptionStatus === "active"
    ) {
      return res.status(400).json({
        success: false,
        message: "Business registration is already completed",
      });
    }

    // --------------------------------------
    // Existing draft -> update
    // --------------------------------------

    if (business) {
      business.firmName = firmName.trim();
      business.address = address.trim();
      business.currentCity = currentCity.trim();
      business.currentState = currentState.trim();
      business.pincode = pincode.trim();

      business.registrationStatus = "draft";
      business.subscriptionStatus = "pending";
      business.profileUnlocked = false;

      await business.save();
    }

    // --------------------------------------
    // New draft -> create
    // --------------------------------------

    else {
      business = await Business.create({
        user: userId,

        firmName: firmName.trim(),
        address: address.trim(),
        currentCity: currentCity.trim(),
        currentState: currentState.trim(),
        pincode: pincode.trim(),

        registrationStatus: "draft",
        subscriptionStatus: "pending",
        profileUnlocked: false,
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Business details saved. Complete payment to activate your business.",

      data: {
        businessId: business._id,
        firmName: business.firmName,

        registrationStatus:
          business.registrationStatus,

        subscriptionStatus:
          business.subscriptionStatus,

        profileUnlocked:
          business.profileUnlocked,
      },
    });
  } catch (error) {
    console.error("SAVE BUSINESS DRAFT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save business details",
    });
  }
};

// ======================================================
// GET MY BUSINESS
// Draft bhi return karega
// AddServices autofill ke liye
// ======================================================

exports.getMyBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({
      user: req.user.id,
    })
      .populate(
        "user",
        "name email mobile role"
      )
      .lean();

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: business,
    });
  } catch (error) {
    console.error("GET MY BUSINESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================================================
// DASHBOARD
// Registration/payment status + permissions
// ======================================================

exports.getDashboard = async (req, res) => {
  try {
    const business = await Business.findOne({
      user: req.user.id,
    })
      .populate(
        "user",
        "name email mobile role"
      )
      .lean();

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // --------------------------------------
    // Latest paid subscription
    // --------------------------------------

    const subscription =
      await Subscription.findOne({
        business: business._id,
        status: "paid",
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    // --------------------------------------
    // Permission
    // --------------------------------------

    const unlocked =
      business.registrationStatus === "completed" &&
      business.subscriptionStatus === "active" &&
      business.profileUnlocked === true;

    return res.status(200).json({
      success: true,

      data: {
        business,
        subscription,

        registrationStatus:
          business.registrationStatus,

        subscriptionStatus:
          business.subscriptionStatus,

        profileUnlocked:
          business.profileUnlocked,

        permissions: {
          canAddVehicle: unlocked,
          canAddRoutes: unlocked,
          canAddWorkingAreas: unlocked,
          canUploadDocuments: unlocked,
          canEditFullProfile: unlocked,
        },
      },
    });
  } catch (error) {
    console.error("GET DASHBOARD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================================================
// PUBLIC BUSINESS PROFILE / CARD
// Sirf paid + active business public dikhega
// ======================================================

exports.getPublicBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({
      _id: req.params.id,

      registrationStatus: "completed",
      subscriptionStatus: "active",
      profileUnlocked: true,
      isActive: true,
    })
      .populate(
        "user",
        "name role"
      )
      .lean();

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const [vehicles, routes] =
      await Promise.all([
        Vehicle.find({
          business: business._id,

          status: {
            $ne: "inactive",
          },
        })
          .select(
            "vehicleType capacity bodyType status"
          )
          .lean(),

        Route.find({
          business: business._id,
          isActive: true,
        })
          .select(
            "from to vehicleTypes"
          )
          .lean(),
      ]);

    return res.status(200).json({
      success: true,

      data: {
        _id: business._id,

        name:
          business.user?.name || "",

        role:
          business.user?.role || "",

        firmName:
          business.firmName,

        location: {
          city:
            business.currentCity,

          state:
            business.currentState,
        },

        workingAreas:
          business.workingAreas || [],

        vehicles,

        routes,
      },
    });
  } catch (error) {
    console.error(
      "GET PUBLIC BUSINESS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};