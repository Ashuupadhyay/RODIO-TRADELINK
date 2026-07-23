const Business = require("../models/business");

const getDashboard = async (req, res) => {
  try {
    const business = await Business.findOne({ user: req.user.id });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found",
      });
    }

    const today = new Date();

    let subscriptionStatus = "Free";

    if (business.subscription?.expiryDate) {
      subscriptionStatus =
        business.subscription.expiryDate >= today
          ? "Active"
          : "Expired";
    }

    res.status(200).json({
      success: true,

      data: {
        firmName: business.firmName,
        ownerName: business.ownerName,

        referralCode: business.referralCode,

        expiryDate: business.subscription?.expiryDate,

        renewalStatus:
          business.subscription?.renewalStatus || "Pending",

        subscriptionStatus,

        profileCompleted: business.profileCompleted,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};