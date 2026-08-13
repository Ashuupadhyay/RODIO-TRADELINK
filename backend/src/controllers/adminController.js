// controllers/adminController.js
const Referral = require("../models/Referral");
const User = require("../models/register");

// 1. एडमिन के लिए: सभी रेफरल्स और उनकी UPI Details देखना
exports.getAllReferralPayouts = async (req, res) => {
  try {
    const referrals = await Referral.find()
      .populate("referrer", "firmName mobile upiId referralCode")
      .populate("referredUser", "firmName mobile createdAt")
      .populate("payment", "amount planSelected status createdAt")
      .sort({ createdAt: -1 });

    const formattedData = referrals.map((ref) => ({
      referralId: ref._id,
      // Referrer (User A - जिसको पैसा मिलना है)
      referrerDetails: {
        id: ref.referrer?._id,
        name: ref.referrer?.firmName || "N/A",
        mobile: ref.referrer?.mobile || "N/A",
        upiId: ref.referrer?.upiId || "UPI ID Not Updated", // Admin PhonePe/GPay से इस पर भेजेगा
        referralCode: ref.referrer?.referralCode,
      },
      // Referred User (User B - जिसने नया प्लान खरीदा)
      referredUserDetails: {
        id: ref.referredUser?._id,
        name: ref.referredUser?.firmName || "N/A",
        mobile: ref.referredUser?.mobile || "N/A",
        joinedAt: ref.referredUser?.createdAt,
      },
      // Reward and Payment Details
      rewardAmount: ref.reward, // जैसे ₹84, ₹139, ₹224
      planPurchased: ref.payment?.planSelected || "N/A",
      status: ref.status, // pending, available, withdrawn, revoked
      createdAt: ref.createdAt,
    }));

    return res.status(200).json({
      success: true,
      totalCount: formattedData.length,
      data: formattedData,
    });
  } catch (error) {
    console.error("GET ADMIN PAYOUTS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. मैन्युअल पेमेंट करने के बाद एडमिन द्वारा 'Mark as Paid' करना
exports.markPayoutAsPaid = async (req, res) => {
  try {
    const { referralId } = req.body;

    const referral = await Referral.findById(referralId);
    if (!referral) {
      return res.status(404).json({ success: false, message: "Referral record not found." });
    }

    if (referral.status === "withdrawn") {
      return res.status(400).json({ success: false, message: "Reward is already marked as Paid." });
    }

    if (referral.status === "revoked") {
      return res.status(400).json({ success: false, message: "Cannot pay for a revoked referral." });
    }

    // Status 'withdrawn' अपडेट करें
    referral.status = "withdrawn";
    await referral.save();

    // User A की `referralEarning` में भी क्रेडिट जोड़ें
    const referrerUser = await User.findById(referral.referrer);
    if (referrerUser) {
      referrerUser.referralEarning = (referrerUser.referralEarning || 0) + referral.reward;
      await referrerUser.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payout status successfully updated to Paid (Withdrawn)!",
      referralId: referral._id,
      amountPaid: referral.reward,
    });
  } catch (error) {
    console.error("MARK PAID ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};