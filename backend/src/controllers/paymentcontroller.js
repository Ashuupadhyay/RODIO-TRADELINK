const crypto = require("crypto");
const Referral = require("../models/Referral");
const razorpay = require("../config/razorpay");
const Payment = require("../models/Payment");
const User = require("../models/register");
const Business = require("../models/business"); // Import Business Model
const generateReceiptNumber = require("../utills/generateReceiptNumber");
const generateReferralCode = require("../utills/generateReferralCode");

// ================================================
// CREATE ORDER (Pre-Payment Referral Check)
// ================================================

exports.createOrder = async (req, res) => {
  try {
    const { referralCode } = req.body;
    const amount = 101; // Future me Plan collection se amount aayega

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    let referralUser = null;

    // ===============================================
    // Referral Validation (Business Model Lookup)
    // ===============================================
    if (referralCode && referralCode.trim() !== "") {
      const code = referralCode.trim();

      // 1. Search Referral Code in Business Collection
      const referralBusiness = await Business.findOne({ referralCode: code });

      if (!referralBusiness) {
        return res.status(400).json({
          success: false,
          message: "Invalid referral code",
        });
      }

      const referrerUserId = referralBusiness.user;

      // 2. Self Referral Check
      if (referrerUserId.toString() === req.user.id.toString()) {
        return res.status(400).json({
          success: false,
          message: "You cannot use your own referral code.",
        });
      }

      // 3. Find Referrer's User Account to check Subscription
      referralUser = await User.findById(referrerUserId);

      if (!referralUser) {
        return res.status(400).json({
          success: false,
          message: "Referrer user account not found.",
        });
      }

      // 4. Referral owner's subscription should be active
      if (referralUser.subscription?.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Referral code is inactive.",
        });
      }

      // 5. Referral owner's subscription should not be expired
      if (
        referralUser.subscription.endDate &&
        new Date(referralUser.subscription.endDate) < new Date()
      ) {
        return res.status(400).json({
          success: false,
          message: "Referral code has expired.",
        });
      }

      // 6. Check if current user already used a referral
      const currentUser = await User.findById(req.user.id);
      if (currentUser && currentUser.referredBy) {
        return res.status(400).json({
          success: false,
          message: "Referral already used.",
        });
      }
    }

    // Create Razorpay Order
    const options = {
      amount: amount * 100, // Paise me convert karne ke liye
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      user: req.user.id,
      orderId: order.id,
      amount,
      referralCode: referralCode ? referralCode.trim() : null,
      status: "created",
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================================
// VERIFY PAYMENT
// ================================================

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are required",
      });
    }

    // Verify Razorpay Signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const payment = await Payment.findOne({
      orderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    if (payment.status === "success") {
      return res.status(400).json({
        success: false,
        message: "Payment already verified",
      });
    }

    const user = await User.findById(payment.user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find Referrer via Business Collection
    let referralUser = null;
    if (payment.referralCode) {
      const referralBusiness = await Business.findOne({
        referralCode: payment.referralCode,
      });

      if (referralBusiness) {
        referralUser = await User.findById(referralBusiness.user);
      }
    }

    // Update Payment Details
    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;

    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    payment.method = paymentDetails.method;
    payment.status = "success";

    if (!payment.receiptNumber) {
      payment.receiptNumber = generateReceiptNumber();
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);

    payment.subscriptionStart = startDate;
    payment.subscriptionEnd = endDate;

    // Activate Subscription
    user.subscription = {
      status: "active",
      plan: "Monthly",
      startDate,
      endDate,
    };

    if (!user.referralCode) {
      user.referralCode = generateReferralCode();
    }

    if (referralUser) {
      user.referredBy = referralUser._id;
      referralUser.referralCount = (referralUser.referralCount || 0) + 1;
      referralUser.referralEarning = (referralUser.referralEarning || 0) + 1;

      const existingReferral = await Referral.findOne({
        payment: payment._id,
      });

      if (!existingReferral) {
        await Referral.create({
          referrer: referralUser._id,
          referredUser: user._id,
          referralCode: payment.referralCode,
          payment: payment._id,
          reward: 1,
          status: "completed",
        });
      }

      await referralUser.save();
    }

    await payment.save();
    await user.save();

    // Process Refund if a valid referral code was used
    if (payment.referralCode && referralUser) {
      try {
        const refund = await razorpay.payments.refund(
          razorpay_payment_id,
          {
            amount: 100, // ₹1 = 100 paise
            speed: "normal",
          }
        );
        payment.refundId = refund.id;
        payment.refundStatus = refund.status;
        payment.refundAmount = 1;

        await payment.save();
      } catch (err) {
        console.error("Refund Error:", err);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      subscription: user.subscription,
      referralCode: user.referralCode,
      receiptNumber: payment.receiptNumber,
      paymentId: payment._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================================
// GET RECEIPT
// ================================================

exports.getReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId).populate(
      "user",
      "name email mobile role"
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    return res.status(200).json({
      success: true,
      receipt: {
        receiptNumber: payment.receiptNumber,
        paymentStatus: payment.status,
        orderId: payment.orderId,
        paymentId: payment.paymentId,
        paymentMethod: payment.method,
        amount: payment.amount,
        currency: payment.currency,
        refundAmount: payment.refundAmount || 0,
        refundStatus: payment.refundStatus || null,
        subscriptionStart: payment.subscriptionStart,
        subscriptionEnd: payment.subscriptionEnd,
        paymentDate: payment.createdAt,
        referralCode: payment.referralCode || null,
        customer: {
          id: payment.user._id,
          name: payment.user.name,
          email: payment.user.email,
          mobile: payment.user.mobile,
          role: payment.user.role,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};