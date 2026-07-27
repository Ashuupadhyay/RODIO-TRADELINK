const Business = require("../models/Business");

const requireActiveSubscription = async (
  req,
  res,
  next
) => {
  try {
    const business = await Business.findOne({
      user: req.user.id,
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found",
      });
    }

    if (
      business.subscriptionStatus !== "active" ||
      !business.profileUnlocked
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Active subscription required to use this feature",
      });
    }

    req.business = business;

    next();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = requireActiveSubscription;