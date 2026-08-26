const User = require("../models/register");
const Business = require("../models/business");
const Subscription = require("../models/suscription");

const expireSubscriptions = async () => {
  try {
    const now = new Date();

    // ==========================================
    // FIND EXPIRED USERS
    // ==========================================

    const expiredUsers = await User.find({
      "subscription.status": "active",
      "subscription.endDate": {
        $ne: null,
        $lte: now,
      },
    })
      .select("_id")
      .lean();

    if (expiredUsers.length === 0) {
      return {
        success: true,
        expiredCount: 0,
      };
    }

    const userIds = expiredUsers.map((user) => user._id);

    // ==========================================
    // LOCK USER SUBSCRIPTION
    // ==========================================

    await User.updateMany(
      {
        _id: { $in: userIds },
      },
      {
        $set: {
          "subscription.status": "expired",
        },
      }
    );

    // ==========================================
    // LOCK BUSINESS
    // ==========================================

    await Business.updateMany(
      {
        user: { $in: userIds },
      },
      {
        $set: {
          subscriptionStatus: "expired",
          profileUnlocked: false,
          isActive: false,
        },
      }
    );

    // ==========================================
    // EXPIRE SUBSCRIPTION RECORD
    // ==========================================

    await Subscription.updateMany(
      {
        user: { $in: userIds },
        status: "paid",
        expiryDate: {
          $ne: null,
          $lte: now,
        },
      },
      {
        $set: {
          status: "expired",
        },
      }
    );

    console.log(
      `Expired ${userIds.length} subscription(s)`
    );

    return {
      success: true,
      expiredCount: userIds.length,
    };
  } catch (error) {
    console.error(
      "SUBSCRIPTION EXPIRY ERROR:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = expireSubscriptions;