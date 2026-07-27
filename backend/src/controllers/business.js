const Business = require("../models/business");
const Vehicle = require("../models/vehicle");
const Route = require("../models/route");
const Subscription = require("../models/suscription");

// ==========================================
// CREATE / UPDATE BASIC BUSINESS
// ==========================================

exports.saveBusiness = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      firmName,
      address,
      currentCity,
      currentState,
      pincode,
    } = req.body;

    if (
      !firmName ||
      !address ||
      !currentCity ||
      !currentState ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "All business fields are required",
      });
    }

    const business = await Business.findOneAndUpdate(
      {
        user: userId,
      },
      {
        $set: {
          firmName,
          address,
          currentCity,
          currentState,
          pincode,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Business details saved",
      data: business,
    });
  } catch (error) {
    console.error("saveBusiness:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// MY BUSINESS
// ==========================================

exports.getMyBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({
      user: req.user.id,
    })
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
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// DASHBOARD
// ==========================================

exports.getDashboard = async (req, res) => {
  try {
    const business = await Business.findOne({
      user: req.user.id,
    })
      .populate("user", "name email mobile role")
      .lean();

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const subscription = await Subscription.findOne({
      business: business._id,
      status: "paid",
    })
      .sort({ createdAt: -1 })
      .lean();

    const unlocked =
      business.subscriptionStatus === "active" &&
      business.profileUnlocked === true;

    return res.status(200).json({
      success: true,

      data: {
        business,

        subscription,

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
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// PUBLIC BUSINESS CARD
// ==========================================

exports.getPublicBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({
      _id: req.params.id,
      subscriptionStatus: "active",
      profileUnlocked: true,
      isActive: true,
    })
      .populate("user", "name role")
      .lean();

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
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

        name: business.user?.name,

        firmName: business.firmName,

        location: {
          city: business.currentCity,
          state: business.currentState,
        },

        workingAreas: business.workingAreas,

        vehicles,

        routes,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};