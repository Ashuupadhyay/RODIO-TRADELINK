const crypto = require("crypto");
const Referral = require("../models/Referral");
const razorpay = require("../config/razorpay");

const Payment = require("../models/Payment");
const User = require("../models/register");

const generateReferralCode = require("../utills/generateReferralCode");

// ================================
// CREATE ORDER
// ================================

exports.createOrder = async (req, res) => {
  try {
   
    const { amount,referralCode } = req.body;
    console.log(amount);
    console.log(referralCode)

    // Future me Plan collection se amount aayega
    amount = 999;
    if (!amount) {
  return res.status(400).json({
    success: false,
    message: "Amount is required",
  });
}

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      user: req.user._id,
      orderId: order.id,
      amount,
      referralCode,
      status: "created",
    });
 console.log("paymentorder",order);
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

// ================================
// VERIFY PAYMENT
// ================================

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      method,
    } = req.body;

    // Required Fields
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

    // Find Payment
    const payment = await Payment.findOne({
      orderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Already Verified
    if (payment.status === "success") {
      return res.status(400).json({
        success: false,
        message: "Payment already verified",
      });
    }
/*
    // Update Payment
    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.method = method || null;
    payment.status = "success";

    const startDate = new Date();

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);

    payment.subscriptionStart = startDate;
    payment.subscriptionEnd = endDate;
*/

const user = await User.findById(payment.user);

if (!user) {
  return res.status(404).json({
    success: false,
    message: "User not found",
  });
}
/*
    await payment.save();

    // Activate Subscription
    

    user.subscription = {
      status: "active",
      plan: "Monthly",
      startDate,
      endDate,
    };

    // Generate Referral Code (only first time)
    if (!user.referralCode) {
      user.referralCode = generateReferralCode();
    }

    await user.save();
    */
    // ===============================
// Referral Validation
// ===============================
let referralUser = null;

if (payment.referralCode) {

  referralUser = await User.findOne({
    referralCode: payment.referralCode,
  });

  if (!referralUser) {
    return res.status(400).json({
      success: false,
      message: "Invalid referral code",
    });
  }

  // Self Referral Check
  if (referralUser._id.toString() === user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: "You cannot use your own referral code.",
    });
  }


  if (user.referredBy) {
  return res.status(400).json({
    success: false,
    message: "Referral already used.",
  });
}
}

 // Update Payment
    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.method = method || null;
    payment.status = "success";

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


     // Generate Referral Code (only first time)
    if (!user.referralCode) {
      user.referralCode = generateReferralCode();
    }
    if (referralUser) {
  user.referredBy = referralUser._id;

  referralUser.referralCount += 1;
  referralUser.referralEarning += 100;



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
await payment.save();
await user.save();
    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      subscription: user.subscription,
      referralCode: user.referralCode,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};