const crypto = require("crypto");
const Referral = require("../models/Referral");
const razorpay = require("../config/razorpay");
const Payment = require("../models/Payment");
const User = require("../models/register");
const Business = require("../models/business");
const generateReceiptNumber = require("../utills/generateReceiptNumber");
const generateReferralCode = require("../utills/generateReferralCode");

// Static Referral Codes Setup (Added TO50 for 299)
const STATIC_REFERRAL_CODES = {
  FREE100: 0,       // ₹0 Payment
  TO50: 299,        // ₹299 Payment
  DISCOUNT599: 599  // ₹599 Payment
};

// ================================================
// CREATE ORDER (Pre-Payment Checks & Validations)
// ================================================

exports.createOrder = async (req, res) => {
  try {
    const { referralCode, email, mobile } = req.body;

    let amount = 999; // Default Amount

    // Static referral code check and amount override
    if (referralCode && STATIC_REFERRAL_CODES.hasOwnProperty(referralCode.trim().toUpperCase())) {
      amount = STATIC_REFERRAL_CODES[referralCode.trim().toUpperCase()];
    }

    if (amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    // ===============================================
    // 1. UNIQUE EMAIL & MOBILE VALIDATION
    // ===============================================

    if (email) {
      const existingEmailUser = await User.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: req.user.id },
      });

      if (existingEmailUser) {
        return res.status(400).json({
          success: false,
          message:
            "Yeh Email ID pehle se kisi aur account me registered hai!",
        });
      }
    }

    if (mobile) {
      const existingMobileUser = await User.findOne({
        mobile: mobile.trim(),
        _id: { $ne: req.user.id },
      });

      if (existingMobileUser) {
        return res.status(400).json({
          success: false,
          message:
            "your email or mobile number is already exixts !",
        });
      }
    }

    // ===============================================
    // 2. Referral Validation
    // ===============================================

    let referralUser = null;
    const isStaticReferral = referralCode && STATIC_REFERRAL_CODES.hasOwnProperty(referralCode.trim().toUpperCase());

    if (referralCode && referralCode.trim() !== "") {
      const code = referralCode.trim();

      if (!isStaticReferral) {
        referralUser = await User.findOne({
          referralCode: code,
        });

        if (!referralUser) {
          return res.status(400).json({
            success: false,
            message: "Invalid referral code",
          });
        }

        if (
          referralUser._id.toString() ===
          req.user.id.toString()
        ) {
          return res.status(400).json({
            success: false,
            message: "You cannot use your own referral code.",
          });
        }

        if (
          referralUser.subscription?.status !==
          "active"
        ) {
          return res.status(400).json({
            success: false,
            message: "Referral code is inactive.",
          });
        }

        if (
          referralUser.subscription?.endDate &&
          new Date(referralUser.subscription.endDate) <
            new Date()
        ) {
          return res.status(400).json({
            success: false,
            message: "Referral code has expired.",
          });
        }
      }

      const currentUser = await User.findById(req.user.id);

      if (currentUser && currentUser.referredBy) {
        return res.status(400).json({
          success: false,
          message: "Referral already used.",
        });
      }
    }

    // ===============================================
    // 3. CREATE ORDER / DIRECT ACTIVATION FOR ₹0
    // ===============================================

    // DIRECT ACTIVATION FOR FREE (₹0) ORDER
    if (amount === 0) {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 6);

      // 1. Create Payment Record
      const freePayment = await Payment.create({
        user: req.user.id,
        orderId: `free_order_${Date.now()}`,
        paymentId: `FREE_PAY_${Date.now()}`,
        amount: 0,
        referralCode: referralCode ? referralCode.trim() : null,
        status: "success",
        method: "REFERRAL_FREE",
        receiptNumber: generateReceiptNumber(),
        subscriptionStart: startDate,
        subscriptionEnd: endDate
      });

      // 2. Activate User Subscription
      const user = await User.findById(req.user.id);
      user.subscription = {
        status: "active",
        plan: "6 Months",
        startDate,
        endDate,
      };

      if (!user.referralCode) {
        user.referralCode = generateReferralCode();
      }
      await user.save();

      // 3. Activate Business Profile & Hidden Features
      const business = await Business.findOne({ user: user._id });
      if (business) {
        business.registrationStatus = "completed";
        business.subscriptionStatus = "active";
        business.profileUnlocked = true;
        business.isActive = true;
        await business.save();
      }

      return res.status(201).json({
        success: true,
        message: "Free subscription activated successfully!",
        isFree: true,
        receiptNumber: freePayment.receiptNumber,
        paymentId: freePayment._id,
        subscription: user.subscription
      });
    }

    // Normal Paid Order Creation for ₹299, ₹599 & ₹999 (Razorpay)
    const options = {
      amount: amount * 100,
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
        message:
          "Payment details are required",
      });
    }

    // ================================================
    // VERIFY RAZORPAY SIGNATURE
    // ================================================

    const body =
      `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body)
      .digest("hex");

    if (
      expectedSignature !== razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // ================================================
    // FIND PAYMENT
    // ================================================

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

    // ================================================
    // FIND USER
    // ================================================

    const user =
      await User.findById(payment.user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ================================================
    // FIND REFERRER
    // ================================================
    let referralUser = null;

    if (payment.referralCode && !STATIC_REFERRAL_CODES.hasOwnProperty(payment.referralCode.trim().toUpperCase())) {
      referralUser = await User.findOne({
        referralCode: payment.referralCode,
      });
    }

    // ================================================
    // UPDATE PAYMENT DETAILS
    // ================================================

    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;

    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    payment.method = paymentDetails.method;
    payment.status = "success";

    if (!payment.receiptNumber) {
      payment.receiptNumber = generateReceiptNumber();
    }

    // ================================================
    // SUBSCRIPTION DATES
    // ================================================

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 6);

    payment.subscriptionStart = startDate;
    payment.subscriptionEnd = endDate;

    // ================================================
    // ACTIVATE USER SUBSCRIPTION
    // ================================================

    user.subscription = {
      status: "active",
      plan: "6 Months",
      startDate,
      endDate,
    };

    if (!user.referralCode) {
      user.referralCode = generateReferralCode();
    }

    // ================================================
    // REFERRAL
    // ================================================

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
          reward: 100,
          status: "completed",
        });
      }

      await referralUser.save();
    }

    // ================================================
    // SAVE PAYMENT + USER
    // ================================================

    await payment.save();
    await user.save();

    // ================================================
    // ACTIVATE BUSINESS & UNLOCK HIDDEN FEATURES
    // ================================================

    const business = await Business.findOne({
      user: user._id,
    });

    if (!business) {
      console.error(
        "BUSINESS DRAFT NOT FOUND FOR USER:",
        user._id
      );

      return res.status(404).json({
        success: false,
        message: "Business draft not found",
      });
    }

    business.registrationStatus = "completed";
    business.subscriptionStatus = "active";
    business.profileUnlocked = true;
    business.isActive = true;

    await business.save();

    console.log("BUSINESS ACTIVATED:", business._id);

    // ================================================
    // PROCESS REFUND (Only if Dynamic Referrer Exists)
    // ================================================

    if (payment.referralCode && referralUser) {
      try {
        const refund = await razorpay.payments.refund(razorpay_payment_id, {
          amount: 100 * 100,
          speed: "normal",
        });

        payment.refundId = refund.id;
        payment.refundStatus = refund.status;
        payment.refundAmount = 100;

        await payment.save();
      } catch (err) {
        console.error("Refund Error:", err);
      }
    }

    // ================================================
    // RESPONSE
    // ================================================

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      subscription: user.subscription,
      referralCode: user.referralCode,
      receiptNumber: payment.receiptNumber,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

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