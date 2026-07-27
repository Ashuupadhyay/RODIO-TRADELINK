const crypto = require("crypto");
const Referral = require("../models/Referral");
const razorpay = require("../config/razorpay");
const Payment = require("../models/Payment");
const User = require("../models/register");
const Business = require("../models/business");
const generateReceiptNumber = require("../utills/generateReceiptNumber");
const generateReferralCode = require("../utills/generateReferralCode");

// ================================================
// CREATE ORDER (Pre-Payment Checks & Validations)
// ================================================

exports.createOrder = async (req, res) => {
  try {
    const { referralCode, email, mobile } = req.body;

    const amount = 1;

    if (!amount) {
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

if (referralCode && referralCode.trim() !== "") {
  const code = referralCode.trim();

  // Referral code User collection me stored hai
  referralUser = await User.findOne({
    referralCode: code,
  });

  // Invalid referral code
  if (!referralUser) {
    return res.status(400).json({
      success: false,
      message: "Invalid referral code",
    });
  }

  // Self Referral Check
  if (
    referralUser._id.toString() ===
    req.user.id.toString()
  ) {
    return res.status(400).json({
      success: false,
      message: "You cannot use your own referral code.",
    });
  }

  // Referral owner's subscription active check
  if (
    referralUser.subscription?.status !==
    "active"
  ) {
    return res.status(400).json({
      success: false,
      message: "Referral code is inactive.",
    });
  }

  // Subscription expiry check
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

  // Already used referral check
  const currentUser = await User.findById(
    req.user.id
  );

  if (
    currentUser &&
    currentUser.referredBy
  ) {
    return res.status(400).json({
      success: false,
      message: "Referral already used.",
    });
  }
}

    // ===============================================
    // 3. CREATE RAZORPAY ORDER
    // ===============================================

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order =
      await razorpay.orders.create(options);

    await Payment.create({
      user: req.user.id,
      orderId: order.id,
      amount,
      referralCode: referralCode
        ? referralCode.trim()
        : null,
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

if (payment.referralCode) {
  referralUser = await User.findOne({
    referralCode: payment.referralCode,
  });
}

    // ================================================
    // UPDATE PAYMENT DETAILS
    // ================================================

    payment.paymentId =
      razorpay_payment_id;

    payment.signature =
      razorpay_signature;

    const paymentDetails =
      await razorpay.payments.fetch(
        razorpay_payment_id
      );

    payment.method =
      paymentDetails.method;

    payment.status = "success";

    if (!payment.receiptNumber) {
      payment.receiptNumber =
        generateReceiptNumber();
    }

    // ================================================
    // SUBSCRIPTION DATES
    // ================================================

    const startDate = new Date();

    const endDate =
      new Date(startDate);

    endDate.setDate(
      endDate.getDate() + 30
    );

    payment.subscriptionStart =
      startDate;

    payment.subscriptionEnd =
      endDate;

    // ================================================
    // ACTIVATE USER SUBSCRIPTION
    // ================================================

    user.subscription = {
      status: "active",
      plan: "Monthly",
      startDate,
      endDate,
    };

    if (!user.referralCode) {
      user.referralCode =
        generateReferralCode();
    }

    // ================================================
    // REFERRAL
    // ================================================

    if (referralUser) {
      user.referredBy =
        referralUser._id;

      referralUser.referralCount =
        (referralUser.referralCount || 0) +
        1;

      referralUser.referralEarning =
        (referralUser.referralEarning ||
          0) + 1;

      const existingReferral =
        await Referral.findOne({
          payment: payment._id,
        });

      if (!existingReferral) {
        await Referral.create({
          referrer:
            referralUser._id,

          referredUser:
            user._id,

          referralCode:
            payment.referralCode,

          payment:
            payment._id,

          reward: 1,

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
    // FIX:
    // ACTIVATE BUSINESS AFTER PAYMENT
    // ================================================

    const business =
      await Business.findOne({
        user: user._id,
      });

    if (!business) {
      console.error(
        "BUSINESS DRAFT NOT FOUND FOR USER:",
        user._id
      );

      return res.status(404).json({
        success: false,
        message:
          "Business draft not found",
      });
    }

    business.registrationStatus =
      "completed";

    business.subscriptionStatus =
      "active";

    business.profileUnlocked = true;

    business.isActive = true;

    await business.save();

    console.log(
      "BUSINESS ACTIVATED:",
      business._id
    );

    // ================================================
    // PROCESS REFUND
    // ================================================

    if (
      payment.referralCode &&
      referralUser
    ) {
      try {
        const refund =
          await razorpay.payments.refund(
            razorpay_payment_id,
            {
              amount: 100,
              speed: "normal",
            }
          );

        payment.refundId =
          refund.id;

        payment.refundStatus =
          refund.status;

        payment.refundAmount = 1;

        await payment.save();
      } catch (err) {
        console.error(
          "Refund Error:",
          err
        );
      }
    }

    // ================================================
    // RESPONSE
    // ================================================

    return res.status(200).json({
      success: true,
      message:
        "Payment verified successfully",

      subscription:
        user.subscription,

      referralCode:
        user.referralCode,

      receiptNumber:
        payment.receiptNumber,

      paymentId:
        payment._id,
    });
  } catch (error) {
    console.error(
      "VERIFY PAYMENT ERROR:",
      error
    );

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
    const { paymentId } =
      req.params;

    const payment =
      await Payment.findById(
        paymentId
      ).populate(
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
        receiptNumber:
          payment.receiptNumber,

        paymentStatus:
          payment.status,

        orderId:
          payment.orderId,

        paymentId:
          payment.paymentId,

        paymentMethod:
          payment.method,

        amount:
          payment.amount,

        currency:
          payment.currency,

        refundAmount:
          payment.refundAmount || 0,

        refundStatus:
          payment.refundStatus || null,

        subscriptionStart:
          payment.subscriptionStart,

        subscriptionEnd:
          payment.subscriptionEnd,

        paymentDate:
          payment.createdAt,

        referralCode:
          payment.referralCode || null,

        customer: {
          id:
            payment.user._id,

          name:
            payment.user.name,

          email:
            payment.user.email,

          mobile:
            payment.user.mobile,

          role:
            payment.user.role,
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