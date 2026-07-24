const Business = require("../models/business");

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const business = await Business.findOne({
      user: userId,
    }).populate(
      "user",
      "name email mobile role subscription referralCode"
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found",
      });
    }

    // ============================
    // SUBSCRIPTION STATUS
    // ============================

    const subscriptionStatus =
      business.user?.subscription?.status || "inactive";

    // ============================
    // REFERRAL
    // ============================

    const hasActiveSubscription =
      subscriptionStatus === "active";

    return res.status(200).json({
      success: true,
      data: {
        // User
        name: business.user?.name || "",
        role: business.user?.role || "",
        email: business.user?.email || "",
        mobile: business.user?.mobile || "",

        // Business
        firmName: business.firmName || "",
        ownerName: business.ownerName || "",
        profileCompleted:
          business.profileCompleted || false,

        // Subscription
        subscription: {
          status: subscriptionStatus,

          plan:
            business.user?.subscription?.plan ||
            "Monthly",

          startDate:
            business.user?.subscription?.startDate ||
            null,

          endDate:
            business.user?.subscription?.endDate ||
            null,
        },

        // Referral
        referral: {
          referralCode: hasActiveSubscription
            ? business.user?.referralCode || null
            : null,

          message: hasActiveSubscription
            ? null
            : "You don't have a referral code. First add a service.",
        },
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};