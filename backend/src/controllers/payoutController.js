// controllers/payoutController.js
const User = require("../models/register");
const Referral = require("../models/Referral");

// 1. Admin Panel Data: User Name, Referral Code, Total Users Created, Pending Reward Amount
exports.getAdminReferralDashboard = async (req, res) => {
  try {
    const referrals = await Referral.find()
      .populate("referrer", "firmName name mobile upiId referralCode")
      .populate("referredUser", "firmName name mobile role createdAt")
      .populate("payment", "planSelected amount status createdAt")
      .sort({ createdAt: -1 });

    const referrerMap = {};

    referrals.forEach((ref) => {
      const referrerId = ref.referrer?._id?.toString();
      if (!referrerId) return;

      if (!referrerMap[referrerId]) {
        referrerMap[referrerId] = {
          referrerId: ref.referrer._id,
          referrerName: ref.referrer.firmName || ref.referrer.name || "User",
          referrerMobile: ref.referrer.mobile,
          referrerUpiId: ref.referrer.upiId || "Not Added",
          referralCode: ref.referrer.referralCode,
          totalUsersCreated: 0,
          pendingRewardAmount: 0,
          paidRewardAmount: 0,
          createdUsersList: [],
        };
      }

      referrerMap[referrerId].createdUsersList.push({
        referralId: ref._id,
        userName: ref.referredUser?.firmName || ref.referredUser?.name || "N/A",
        userMobile: ref.referredUser?.mobile || "N/A",
        planSelected: ref.payment?.planSelected || "N/A",
        rewardAmount: ref.reward,
        status: ref.status,
        date: ref.createdAt,
      });

      referrerMap[referrerId].totalUsersCreated += 1;

      if (ref.status === "pending") {
        referrerMap[referrerId].pendingRewardAmount += ref.reward;
      } else if (ref.status === "withdrawn") {
        referrerMap[referrerId].paidRewardAmount += ref.reward;
      }
    });

    return res.status(200).json({
      success: true,
      data: Object.values(referrerMap),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Admin Action: Manual Payment के बाद "Success / Paid" Mark करना
exports.markPaymentSuccess = async (req, res) => {
  try {
    const { referrerId, referralId } = req.body;

    if (referralId) {
      const referral = await Referral.findById(referralId);
      if (!referral) return res.status(404).json({ success: false, message: "Referral not found" });

      if (referral.status === "withdrawn") {
        return res.status(400).json({ success: false, message: "Already marked as Paid" });
      }

      referral.status = "withdrawn";
      await referral.save();

      await User.findByIdAndUpdate(referral.referrer, {
        $inc: { referralEarning: referral.reward }
      });

      return res.status(200).json({ success: true, message: "Marked as Paid successfully" });
    }

    if (referrerId) {
      const pendingReferrals = await Referral.find({ referrer: referrerId, status: "pending" });
      const totalAmount = pendingReferrals.reduce((sum, item) => sum + item.reward, 0);

      await Referral.updateMany(
        { referrer: referrerId, status: "pending" },
        { $set: { status: "withdrawn" } }
      );

      await User.findByIdAndUpdate(referrerId, {
        $inc: { referralEarning: totalAmount }
      });

      return res.status(200).json({ success: true, message: `Cleared ₹${totalAmount} successfully` });
    }

    return res.status(400).json({ success: false, message: "Provide referrerId or referralId" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};