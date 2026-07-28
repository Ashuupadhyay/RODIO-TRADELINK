const Business = require("../models/business");
const User = require("../models/register");
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

    // ==================================================
    // REGISTERED USER FETCH
    // Email + Mobile yahin se lenge
    // ==================================================

    const user = await User.findById(userId).select(
      "name email mobile role"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==================================================
    // BUSINESS FORM DATA
    // ==================================================

    const {
      category,
      firmName,
      address,
      currentCity,
      currentState,
      pincode,
} = req.body;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (
        !category ||
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




    const allowedCategories = [
  "Transporter",
  "Broker",
  "Fleet Owner",
  "Truck Owner",
  "Logistics Company",
  "Warehouse",
  "Courier",
  "Packers & Movers",
  "Commission Agent",
  "RTO Agent",
  "Finance Agent",
  "Others",
];

if (!allowedCategories.includes(category)) {
  return res.status(400).json({
    success: false,
    message: "Invalid business category",
  });
}

    // ==================================================
    // CHECK EXISTING BUSINESS
    // ==================================================

    let business = await Business.findOne({
      user: userId,
    });

    // ==================================================
    // ALREADY COMPLETED
    // ==================================================

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

    // ==================================================
    // EXISTING DRAFT -> UPDATE
    // ==================================================

    if (business) {
      business.category = category;
      business.firmName = firmName.trim();

      // Registered User se automatically
      business.phoneNumber = user.mobile || "";
      business.email = user.email || "";

      business.address = address.trim();
      business.currentCity = currentCity.trim();
      business.currentState = currentState.trim();
      business.pincode = pincode.trim();

      business.registrationStatus = "draft";
      business.subscriptionStatus = "pending";
      business.profileUnlocked = false;

      await business.save();
    }

    // ==================================================
    // NEW DRAFT -> CREATE
    // ==================================================

    else {
      business = await Business.create({
        user: userId,
 category,
        firmName: firmName.trim(),

        // Registered User se automatically
        phoneNumber: user.mobile || "",
        email: user.email || "",

        address: address.trim(),
        currentCity: currentCity.trim(),
        currentState: currentState.trim(),
        pincode: pincode.trim(),

        registrationStatus: "draft",
        subscriptionStatus: "pending",
        profileUnlocked: false,
      });
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      message:
        "Business details saved. Complete payment to activate your business.",

      data: {
        businessId: business._id,

        // Registered account information
        category: business.category,
        name: user.name || "",
        email: business.email || "",
        phoneNumber: business.phoneNumber || "",
        role: user.role || "",

        // Business information
        firmName: business.firmName,
        address: business.address,
        currentCity: business.currentCity,
        currentState: business.currentState,
        pincode: business.pincode,

        // Status
        registrationStatus: business.registrationStatus,
        subscriptionStatus: business.subscriptionStatus,
        profileUnlocked: business.profileUnlocked,
      },
    });
  } catch (error) {
    console.error("SAVE BUSINESS DRAFT ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to save business details",
    });
  }
};

// ======================================================
// GET MY BUSINESS
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
    console.error(
      "GET MY BUSINESS ERROR:",
      error
    );

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
/*
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

    // Latest paid subscription
    const subscription =
      await Subscription.findOne({
        business: business._id,
        status: "paid",
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    // Payment successful hai ya nahi
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
    console.error(
      "GET DASHBOARD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
*/


exports.getDashboard = async (req, res) => {
  try {
    const business = await Business.findOne({
      user: req.user.id,
    })
      .populate(
        "user",
        "name email mobile role subscription"
      )
      .lean();

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Latest Paid Subscription
    const paymentSubscription = await Subscription.findOne({
      business: business._id,
      status: "paid",
    })
      .sort({ createdAt: -1 })
      .lean();

    // Unlock Status
    const unlocked =
      business.registrationStatus === "completed" &&
      business.subscriptionStatus === "active" &&
      business.profileUnlocked === true;

    return res.status(200).json({
      success: true,

      data: {
        // Business Details
        businessId: business._id,
        firmName: business.firmName,
        category: business.category,

        address: business.address,
        currentCity: business.currentCity,
        currentState: business.currentState,
        pincode: business.pincode,

        phoneNumber: business.phoneNumber,
        email: business.email,

        // User
        user: {
          id: business.user?._id,
          name: business.user?.name || "",
          role: business.user?.role || "",
          mobile: business.user?.mobile || "",
          email: business.user?.email || "",
        },

        // User Subscription
        subscription: {
          status:
            business.user?.subscription?.status || "inactive",
          plan:
            business.user?.subscription?.plan || "",
          startDate:
            business.user?.subscription?.startDate || null,
          endDate:
            business.user?.subscription?.endDate || null,
        },

        // Payment Record
        paymentSubscription,

        // Registration Status
        registrationStatus:
          business.registrationStatus,

        subscriptionStatus:
          business.subscriptionStatus,

        profileUnlocked:
          business.profileUnlocked,

        // Permissions
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
      message: error.message || "Server error",
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
category: business.category,
        name:
          business.user?.name || "",

        role:
          business.user?.role || "",

        firmName:
          business.firmName || "",

        // Business me saved registered details
        email:
          business.email || "",

        phoneNumber:
          business.phoneNumber || "",

        address:
          business.address || "",

        pincode:
          business.pincode || "",

        location: {
          city:
            business.currentCity || "",

          state:
            business.currentState || "",
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