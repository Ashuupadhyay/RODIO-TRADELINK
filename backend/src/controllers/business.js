const Business = require("../models/business");
const User = require("../models/register");
const Vehicle = require("../models/vehicle");
const Route = require("../models/route");
const Subscription = require("../models/suscription");

// ======================================================
// SAVE / UPDATE BUSINESS DRAFT
// ======================================================
exports.saveBusinessDraft = async (req, res) => {
  try {
    const userId = req.user.id;
    const {name, address, currentCity, currentState, pincode } = req.body;

    // 1. Validation Check
    // if (
    //   !name?.trim()||
    //   !address?.trim() ||
    //   !currentCity?.trim() ||
    //   !currentState?.trim() ||
    //   !pincode?.trim()
    // ) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "All business fields (Address, City, State, Pincode) are required",
    //   });
    // }

    // if (!/^[1-9][0-9]{5}$/.test(pincode.trim())) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Enter a valid 6 digit pincode",
    //   });
    // }

    // 2. Register User Fetch
    const user = await User.findById(userId).select(
      "name firmName email mobile role"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

// 1. Owner Name -> Directly taken from Form Input (req.body.name)
const resolvedName = name.trim();

// 2. Firm Name -> Auto-taken from Registration User Table
const resolvedFirmName = user.firmName?.trim() || "";
    // 3. Find Existing Business
    // let business = await Business.findOne({ user: userId });

    // // 4. Update OR Create Business Draft
    // if (business) {
    //   business.category = user.role || business.category;
    //   business.name = resolvedName;
    //   business.firmName = resolvedFirmName;
    //   business.phoneNumber = user.mobile || business.phoneNumber || "";
    //   business.email = user.email || business.email || "";

    //   business.address = address.trim();
    //   business.currentCity = currentCity.trim();
    //   business.currentState = currentState.trim();
    //   business.pincode = pincode.trim();

    //   // Explicitly set directory display flags
    //   business.isActive = true;

    //   await business.save();
    // } else {
    //   business = await Business.create({
    //     user: userId,
    //     category: user.role || "Others",
    //     name: resolvedName,
    //     firmName: resolvedFirmName,
    //     phoneNumber: user.mobile || "",
    //     email: user.email || "",

    //     address: address.trim(),
    //     currentCity: currentCity.trim(),
    //     currentState: currentState.trim(),
    //     pincode: pincode.trim(),

    //     registrationStatus: "draft",
    //     subscriptionStatus: "pending",
    //     profileUnlocked: false,
    //     isActive: true, // Directly visible in directory
    //   });
    // }
    const business = await Business.findOne({ user: userId });

if (!business) {
  return res.status(404).json({
    success: false,
    message: "Business not found",
  });
}

// Update Existing Business
business.category = user.role || business.category;
business.name = resolvedName;
business.firmName = resolvedFirmName;
business.phoneNumber = user.mobile || "";
business.email = user.email || "";

business.address = address.trim();
business.currentCity = currentCity.trim();
business.currentState = currentState.trim();
business.pincode = pincode.trim();

business.isActive = true;

await business.save();

    // 5. Response
    return res.status(200).json({
      success: true,
      message: "Business details saved successfully.",
      data: {
        businessId: business._id,
        category: business.category,
        name: business.name,
        email: business.email,
        phoneNumber: business.phoneNumber,
        role: user.role || "",

        firmName: business.firmName,
        address: business.address,
        currentCity: business.currentCity,
        currentState: business.currentState,
        pincode: business.pincode,

        registrationStatus: business.registrationStatus,
        subscriptionStatus: business.subscriptionStatus,
        profileUnlocked: business.profileUnlocked,
      },
    });
  } catch (error) {
    console.error("SAVE BUSINESS DRAFT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to save business details",
    });
  }
};

// ======================================================
// GET MY BUSINESS
// ======================================================
exports.getMyBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({ user: req.user.id })
      .populate("user", "name email mobile role")
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
// ======================================================
exports.getDashboard = async (req, res) => {
  try {
    const business = await Business.findOne({ user: req.user.id })
      .populate("user", "name email mobile role subscription")
      .lean();

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const paymentSubscription = await Subscription.findOne({
      business: business._id,
      status: "paid",
    })
      .sort({ createdAt: -1 })
      .lean();

    const unlocked =
      business.registrationStatus === "completed" &&
      business.subscriptionStatus === "active" &&
      business.profileUnlocked === true;

    return res.status(200).json({
      success: true,
      data: {
        businessId: business._id,
        firmName: business.firmName,
        category: business.category,

        address: business.address,
        currentCity: business.currentCity,
        currentState: business.currentState,
        pincode: business.pincode,

        phoneNumber: business.phoneNumber,
        email: business.email,

        user: {
          id: business.user?._id,
          name: business.user?.name || "",
          role: business.user?.role || "",
          mobile: business.user?.mobile || "",
          email: business.user?.email || "",
        },

        subscription: {
          status: business.user?.subscription?.status || "inactive",
          plan: business.user?.subscription?.plan || "",
          startDate: business.user?.subscription?.startDate || null,
          endDate: business.user?.subscription?.endDate || null,
        },

        paymentSubscription,

        registrationStatus: business.registrationStatus,
        subscriptionStatus: business.subscriptionStatus,
        profileUnlocked: business.profileUnlocked,

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
      message:
        "We couldn't process your request at the moment. Please try again later.",
    });
  }
};

// ======================================================
// PUBLIC BUSINESS PROFILE
// ======================================================
exports.getPublicBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({
      _id: req.params.id,
      isActive: true,
    })
      .populate("user", "name role")
      .lean();

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business card not found",
      });
    }

    const [vehicles, routes] = await Promise.all([
      Vehicle.find({
        business: business._id,
        status: { $ne: "inactive" },
      })
        .select("vehicleType capacity bodyType status")
        .lean(),

      Route.find({
        business: business._id,
        isActive: true,
      })
        .select("from to vehicleTypes")
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        _id: business._id,
        category: business.category,
        name: business.name || business.user?.name || "",
        role: business.user?.role || "",
        firmName: business.firmName || "",

        email: business.email || "",
        phoneNumber: business.phoneNumber || "",
        address: business.address || "",
        pincode: business.pincode || "",

        location: {
          city: business.currentCity || "",
          state: business.currentState || "",
        },

        workingAreas: business.workingAreas || [],
        vehicles,
        routes,
      },
    });
  } catch (error) {
    console.error("GET PUBLIC BUSINESS ERROR:", error);
    return res.status(500).json({
      success: false,
      message:
        "We couldn't process your request at the moment. Please try again later.",
    });
  }
};