// // const crypto = require("crypto");
// // const Referral = require("../models/Referral");
// // const razorpay = require("../config/razorpay");
// // const Payment = require("../models/Payment");
// // const User = require("../models/register");
// // const Business = require("../models/business");
// // const generateReceiptNumber = require("../utills/generateReceiptNumber");
// // const generateReferralCode = require("../utills/generateReferralCode");

// // // Static Referral Codes Setup
// // const STATIC_REFERRAL_CODES = {
// //   FREE100: 0,       // ₹0 Payment
// //   TO50: 299,        // ₹299 Payment
// //   DISCOUNT599: 599  // ₹599 Payment
// // };

// // // ================================================
// // // CREATE ORDER (Pre-Payment Checks & Validations)
// // // ================================================
// // exports.createOrder = async (req, res) => {
// //   try {
// //     const { referralCode, email, mobile } = req.body;

// //     let amount = 999; // Default Amount

// //     // Static referral code check and amount override
// //     if (referralCode && STATIC_REFERRAL_CODES.hasOwnProperty(referralCode.trim().toUpperCase())) {
// //       amount = STATIC_REFERRAL_CODES[referralCode.trim().toUpperCase()];
// //     }

// //     if (amount === undefined || amount === null) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Amount is required",
// //       });
// //     }

// //     // 1. UNIQUE EMAIL & MOBILE VALIDATION
// //     if (email) {
// //       const existingEmailUser = await User.findOne({
// //         email: email.trim().toLowerCase(),
// //         _id: { $ne: req.user.id },
// //       });

// //       if (existingEmailUser) {
// //         return res.status(400).json({
// //           success: false,
// //           message: "Yeh Email ID pehle se kisi aur account me registered hai!",
// //         });
// //       }
// //     }

// //     if (mobile) {
// //       const existingMobileUser = await User.findOne({
// //         mobile: mobile.trim(),
// //         _id: { $ne: req.user.id },
// //       });

// //       if (existingMobileUser) {
// //         return res.status(400).json({
// //           success: false,
// //           message: "Yeh mobile number pehle se registered hai!",
// //         });
// //       }
// //     }

// //     // 2. REFERRAL VALIDATION
// //     let referralUser = null;
// //     const isStaticReferral = referralCode && STATIC_REFERRAL_CODES.hasOwnProperty(referralCode.trim().toUpperCase());

// //     if (referralCode && referralCode.trim() !== "") {
// //       const code = referralCode.trim();

// //       if (!isStaticReferral) {
// //         referralUser = await User.findOne({
// //           referralCode: code,
// //         });

// //         if (!referralUser) {
// //           return res.status(400).json({
// //             success: false,
// //             message: "Invalid referral code",
// //           });
// //         }

// //         if (referralUser._id.toString() === req.user.id.toString()) {
// //           return res.status(400).json({
// //             success: false,
// //             message: "You cannot use your own referral code.",
// //           });
// //         }

// //         if (referralUser.subscription?.status !== "active") {
// //           return res.status(400).json({
// //             success: false,
// //             message: "Referral code is inactive.",
// //           });
// //         }

// //         if (
// //           referralUser.subscription?.endDate &&
// //           new Date(referralUser.subscription.endDate) < new Date()
// //         ) {
// //           return res.status(400).json({
// //             success: false,
// //             message: "Referral code has expired.",
// //           });
// //         }
// //       }

// //       const currentUser = await User.findById(req.user.id);
// //       if (currentUser && currentUser.referredBy) {
// //         return res.status(400).json({
// //           success: false,
// //           message: "Referral already used.",
// //         });
// //       }
// //     }

// //     // 3. CREATE ORDER / DIRECT ACTIVATION FOR ₹0
// //     if (amount === 0) {
// //       const startDate = new Date();
// //       const endDate = new Date(startDate);
// //       endDate.setMonth(endDate.getMonth() + 6);

// //       // Create Payment Record
// //       const freePayment = await Payment.create({
// //         user: req.user.id,
// //         orderId: `free_order_${Date.now()}`,
// //         paymentId: `FREE_PAY_${Date.now()}`,
// //         amount: 0,
// //         referralCode: referralCode ? referralCode.trim() : null,
// //         status: "success",
// //         method: "REFERRAL_FREE",
// //         receiptNumber: generateReceiptNumber(),
// //         subscriptionStart: startDate,
// //         subscriptionEnd: endDate
// //       });

// //       // Activate User Subscription
// //       const user = await User.findById(req.user.id);
// //       user.subscription = {
// //         status: "active",
// //         plan: "6 Months",
// //         startDate,
// //         endDate,
// //       };

// //       if (!user.referralCode) {
// //         user.referralCode = generateReferralCode();
// //       }
// //       await user.save();

// //       // Activate Business Profile
// //       const business = await Business.findOne({ user: user._id });
// //       if (business) {
// //         business.registrationStatus = "completed";
// //         business.subscriptionStatus = "active";
// //         business.profileUnlocked = true;
// //         business.isActive = true;
// //         await business.save();
// //       }

// //       return res.status(201).json({
// //         success: true,
// //         message: "Free subscription activated successfully!",
// //         isFree: true,
// //         receiptNumber: freePayment.receiptNumber,
// //         paymentId: freePayment._id,
// //         subscription: user.subscription
// //       });
// //     }

// //     // Normal Paid Order Creation (Razorpay)
// //     const options = {
// //       amount: amount * 100,
// //       currency: "INR",
// //       receipt: `receipt_${Date.now()}`,
// //     };

// //     const order = await razorpay.orders.create(options);

// //     await Payment.create({
// //       user: req.user.id,
// //       orderId: order.id,
// //       amount,
// //       referralCode: referralCode ? referralCode.trim() : null,
// //       status: "created",
// //     });

// //     return res.status(201).json({
// //       success: true,
// //       message: "Order created successfully",
// //       order,
// //     });
// //   } catch (error) {
// //     return res.status(500).json({
// //       success: false,
// //       message: error.message,
// //     });
// //   }
// // };

// // // ================================================
// // // VERIFY PAYMENT & REWARD LOGIC
// // // ================================================
// // exports.verifyPayment = async (req, res) => {
// //   try {
// //     const {
// //       razorpay_order_id,
// //       razorpay_payment_id,
// //       razorpay_signature,
// //     } = req.body;

// //     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Payment details are required",
// //       });
// //     }

// //     // 1. VERIFY RAZORPAY SIGNATURE
// //     const body = `${razorpay_order_id}|${razorpay_payment_id}`;
// //     const expectedSignature = crypto
// //       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
// //       .update(body)
// //       .digest("hex");

// //     if (expectedSignature !== razorpay_signature) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Invalid payment signature",
// //       });
// //     }

// //     // 2. FIND PAYMENT RECORD
// //     const payment = await Payment.findOne({ orderId: razorpay_order_id });
// //     if (!payment) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Payment record not found",
// //       });
// //     }

// //     if (payment.status === "success") {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Payment already verified",
// //       });
// //     }

// //     // 3. FIND USER B (JISNE PAYMENT KI HAI)
// //     const user = await User.findById(payment.user);
// //     if (!user) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "User not found",
// //       });
// //     }

// //     // 4. FIND USER A (REFERRER - JISKA CODE USE HUA HAI)
// //     let referralUser = null;
// //     if (payment.referralCode && !STATIC_REFERRAL_CODES.hasOwnProperty(payment.referralCode.trim().toUpperCase())) {
// //       referralUser = await User.findOne({
// //         referralCode: payment.referralCode,
// //       });
// //     }

// //     // 5. UPDATE PAYMENT DETAILS
// //     payment.paymentId = razorpay_payment_id;
// //     payment.signature = razorpay_signature;

// //     const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
// //     payment.method = paymentDetails.method;
// //     payment.status = "success";

// //     if (!payment.receiptNumber) {
// //       payment.receiptNumber = generateReceiptNumber();
// //     }

// //     const startDate = new Date();
// //     const endDate = new Date(startDate);
// //     endDate.setMonth(endDate.getMonth() + 6);

// //     payment.subscriptionStart = startDate;
// //     payment.subscriptionEnd = endDate;

// //     // 6. ACTIVATE SUBSCRIPTION FOR USER B
// //     user.subscription = {
// //       status: "active",
// //       plan: "6 Months",
// //       startDate,
// //       endDate,
// //     };

// //     if (!user.referralCode) {
// //       user.referralCode = generateReferralCode();
// //     }

// //     // 7.🎯 REWARD/EARNING LOGIC FOR USER A (REFERRER)
// //     if (referralUser) {
// //       const existingReferral = await Referral.findOne({
// //         payment: payment._id,
// //       });

// //       if (!existingReferral) {
// //         // Mark User B as referred by User A
// //         user.referredBy = referralUser._id;

// //         // Add Earnings & Count to USER A (Code Owner)
// //         referralUser.referralCount = (referralUser.referralCount || 0) + 1;
// //         referralUser.referralEarning = (referralUser.referralEarning || 0) + 100;

// //         // Create Referral Entry Log
// //         await Referral.create({
// //           referrer: referralUser._id, // User A (Earning lene wala)
// //           referredUser: user._id,     // User B (Naya user)
// //           referralCode: payment.referralCode,
// //           payment: payment._id,
// //           reward: 100,
// //           status: "completed",
// //         });

// //         // Save User A Updates
// //         await referralUser.save();
// //       }
// //     }

// //     // 8. ACTIVATE BUSINESS PROFILE
// //     const business = await Business.findOne({ user: user._id });
// //     if (!business) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Business draft not found",
// //       });
// //     }

// //     business.registrationStatus = "completed";
// //     business.subscriptionStatus = "active";
// //     business.profileUnlocked = true;
// //     business.isActive = true;
// //     await business.save();

// //     // Save Payment & User B Updates
// //     await payment.save();
// //     await user.save();

// //     return res.status(200).json({
// //       success: true,
// //       message: "Payment verified successfully",
// //       subscription: user.subscription,
// //       referralCode: user.referralCode,
// //       receiptNumber: payment.receiptNumber,
// //       paymentId: payment._id,
// //     });
// //   } catch (error) {
// //     console.error("VERIFY PAYMENT ERROR:", error);
// //     return res.status(500).json({
// //       success: false,
// //       message: error.message,
// //     });
// //   }
// // };

// // // ================================================
// // // GET RECEIPT
// // // ================================================
// // exports.getReceipt = async (req, res) => {
// //   try {
// //     const { paymentId } = req.params;

// //     const payment = await Payment.findById(paymentId).populate(
// //       "user",
// //       "name email mobile role"
// //     );

// //     if (!payment) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Receipt not found",
// //       });
// //     }

// //     return res.status(200).json({
// //       success: true,
// //       receipt: {
// //         receiptNumber: payment.receiptNumber,
// //         paymentStatus: payment.status,
// //         orderId: payment.orderId,
// //         paymentId: payment.paymentId,
// //         paymentMethod: payment.method,
// //         amount: payment.amount,
// //         currency: payment.currency,
// //         refundAmount: payment.refundAmount || 0,
// //         refundStatus: payment.refundStatus || null,
// //         subscriptionStart: payment.subscriptionStart,
// //         subscriptionEnd: payment.subscriptionEnd,
// //         paymentDate: payment.createdAt,
// //         referralCode: payment.referralCode || null,
// //         customer: {
// //           id: payment.user._id,
// //           name: payment.user.name,
// //           email: payment.user.email,
// //           mobile: payment.user.mobile,
// //           role: payment.user.role,
// //         },
// //       },
// //     });
// //   } catch (error) {
// //     return res.status(500).json({
// //       success: false,
// //       message: error.message,
// //     });
// //   }
// // };





// const crypto = require("crypto");
// const Referral = require("../models/Referral");
// const razorpay = require("../config/razorpay");
// const Payment = require("../models/Payment");
// const User = require("../models/register");
// const Business = require("../models/business");
// const generateReceiptNumber = require("../utills/generateReceiptNumber");
// const generateReferralCode = require("../utills/generateReferralCode");

// // Plan Amounts and Durations Mapping
// const PLAN_DETAILS = {
//   "testing": { name: "Testing Plan", amount: 1, months: 0, days: 1 },
//   "1month": { name: "1 Month", amount: 299, months: 1, days: 0 },
//   "6months": { name: "6 Months", amount: 599, months: 6, days: 0 },
//   "1year": { name: "1 Year", amount: 999, months: 12, days: 0 },
// };

// // Static Referral Codes Setup
// const STATIC_REFERRAL_CODES = {
//   FREE100: 0,       // ₹0 Free Access
//   TO50: 299,        // Override to ₹299
//   DISCOUNT599: 599, // Override to ₹599
// };

// // ======================================================
// // 1. CREATE ORDER (With Card Selection & Role Check)
// // ======================================================
// exports.createOrder = async (req, res) => {
//   try {
//     const { planKey, referralCode, email, mobile } = req.body;
//     const userId = req.user.id;

//     // 1. ROLE CHECK: Regular User Blocked, Only Business/Partner Roles Allowed
//     const currentUser = await User.findById(userId);
//     if (!currentUser) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     if (currentUser.role === "User" || currentUser.role === "user") {
//       return res.status(403).json({
//         success: false,
//         message: "Payment features are restricted for standard user profiles.",
//       });
//     }

//     // 2. PLAN SELECTION LOGIC
//     let plan = PLAN_DETAILS[planKey ? planKey.toLowerCase() : "1year"];
//     if (!plan) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid plan option selected.",
//       });
//     }

//     let finalAmount = plan.amount;

//     // Static Discount Coupon Applied
//     if (referralCode && STATIC_REFERRAL_CODES.hasOwnProperty(referralCode.trim().toUpperCase())) {
//       finalAmount = STATIC_REFERRAL_CODES[referralCode.trim().toUpperCase()];
//     }

//     // 3. UNIQUE EMAIL & MOBILE VALIDATION
//     if (email) {
//       const existingEmail = await User.findOne({ email: email.trim().toLowerCase(), _id: { $ne: userId } });
//       if (existingEmail) {
//         return res.status(400).json({ success: false, message: "Email ID already exists with another user!" });
//       }
//     }

//     if (mobile) {
//       const existingMobile = await User.findOne({ mobile: mobile.trim(), _id: { $ne: userId } });
//       if (existingMobile) {
//         return res.status(400).json({ success: false, message: "Mobile number already registered with another user!" });
//       }
//     }

//     // 4. REFERRAL CODE VALIDATION
//     let referralUser = null;
//     const isStaticReferral = referralCode && STATIC_REFERRAL_CODES.hasOwnProperty(referralCode.trim().toUpperCase());

//     if (referralCode && referralCode.trim() !== "") {
//       const code = referralCode.trim();

//       if (!isStaticReferral) {
//         referralUser = await User.findOne({ referralCode: code });

//         if (!referralUser) {
//           return res.status(400).json({ success: false, message: "Invalid referral code" });
//         }

//         if (referralUser._id.toString() === userId.toString()) {
//           return res.status(400).json({ success: false, message: "You cannot use your own referral code." });
//         }

//         if (referralUser.subscription?.status !== "active") {
//           return res.status(400).json({ success: false, message: "Referral code owner does not have an active subscription." });
//         }

//         if (referralUser.subscription?.endDate && new Date(referralUser.subscription.endDate) < new Date()) {
//           return res.status(400).json({ success: false, message: "Referral code has expired." });
//         }
//       }

//       if (currentUser.referredBy) {
//         return res.status(400).json({ success: false, message: "You have already applied a referral code earlier." });
//       }
//     }

//     // 5. DIRECT ACTIVATION FOR ₹0 FREE SUBSCRIPTION
//     if (finalAmount === 0) {
//       const startDate = new Date();
//       const endDate = new Date(startDate);
//       endDate.setMonth(endDate.getMonth() + 6); // Default 6 Months for FREE100

//       const freePayment = await Payment.create({
//         user: userId,
//         orderId: `free_order_${Date.now()}`,
//         paymentId: `FREE_PAY_${Date.now()}`,
//         amount: 0,
//         planSelected: "Free Plan",
//         referralCode: referralCode ? referralCode.trim() : null,
//         status: "success",
//         method: "REFERRAL_FREE",
//         receiptNumber: generateReceiptNumber(),
//         subscriptionStart: startDate,
//         subscriptionEnd: endDate,
//       });

//       currentUser.subscription = {
//         status: "active",
//         plan: "Free Plan",
//         startDate,
//         endDate,
//       };

//       if (!currentUser.referralCode) {
//         currentUser.referralCode = generateReferralCode();
//       }
//       await currentUser.save();

//       // Unlock Business Profile
//       const business = await Business.findOne({ user: userId });
//       if (business) {
//         business.registrationStatus = "completed";
//         business.subscriptionStatus = "active";
//         business.profileUnlocked = true;
//         business.isActive = true;
//         await business.save();
//       }

//       return res.status(201).json({
//         success: true,
//         message: "Free subscription activated successfully!",
//         isFree: true,
//         receiptNumber: freePayment.receiptNumber,
//         paymentId: freePayment._id,
//         subscription: currentUser.subscription,
//       });
//     }

//     // 6. CREATE RAZORPAY ORDER FOR PAID PLANS (₹1, ₹299, ₹599, ₹999)
//     const options = {
//       amount: finalAmount * 100, // Amount in paise
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);

//     await Payment.create({
//       user: userId,
//       orderId: order.id,
//       amount: finalAmount,
//       planSelected: plan.name,
//       referralCode: referralCode ? referralCode.trim() : null,
//       status: "created",
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       order,
//       planDetails: {
//         key: planKey,
//         name: plan.name,
//         amount: finalAmount,
//       },
//     });
//   } catch (error) {
//     console.error("CREATE ORDER ERROR:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ======================================================
// // 2. VERIFY PAYMENT & REWARD LOGIC
// // ======================================================
// exports.verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({ success: false, message: "Payment details are required" });
//     }

//     // 1. VERIFY SIGNATURE
//     const body = `${razorpay_order_id}|${razorpay_payment_id}`;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body)
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({ success: false, message: "Invalid payment signature" });
//     }

//     // 2. FETCH PAYMENT & USER
//     const payment = await Payment.findOne({ orderId: razorpay_order_id });
//     if (!payment) {
//       return res.status(404).json({ success: false, message: "Payment record not found" });
//     }

//     if (payment.status === "success") {
//       return res.status(400).json({ success: false, message: "Payment already verified" });
//     }

//     const user = await User.findById(payment.user);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // 3. REFERRER USER
//     let referralUser = null;
//     if (payment.referralCode && !STATIC_REFERRAL_CODES.hasOwnProperty(payment.referralCode.trim().toUpperCase())) {
//       referralUser = await User.findOne({ referralCode: payment.referralCode });
//     }

//     // 4. RAZORPAY PAYMENT DETAILS FETCH
//     const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
//     payment.paymentId = razorpay_payment_id;
//     payment.signature = razorpay_signature;
//     payment.method = paymentDetails.method;
//     payment.status = "success";

//     if (!payment.receiptNumber) {
//       payment.receiptNumber = generateReceiptNumber();
//     }

//     // Calculate Expiry Date based on Plan
//     const startDate = new Date();
//     const endDate = new Date(startDate);

//     if (payment.planSelected === "Testing Plan") {
//       endDate.setDate(endDate.getDate() + 1);
//     } else if (payment.planSelected === "1 Month") {
//       endDate.setMonth(endDate.getMonth() + 1);
//     } else if (payment.planSelected === "6 Months") {
//       endDate.setMonth(endDate.getMonth() + 6);
//     } else {
//       endDate.setFullYear(endDate.getFullYear() + 1); // 1 Year Default
//     }

//     payment.subscriptionStart = startDate;
//     payment.subscriptionEnd = endDate;

//     // 5. ACTIVATE USER SUBSCRIPTION
//     user.subscription = {
//       status: "active",
//       plan: payment.planSelected,
//       startDate,
//       endDate,
//     };

//     if (!user.referralCode) {
//       user.referralCode = generateReferralCode();
//     }

//     // 6. REWARD/EARNING LOGIC FOR REFERRER
//     if (referralUser) {
//       const existingReferral = await Referral.findOne({ payment: payment._id });

//       if (!existingReferral) {
//         user.referredBy = referralUser._id;
//         payment.referredBy = referralUser._id;

//         referralUser.referralCount = (referralUser.referralCount || 0) + 1;
//         referralUser.referralEarning = (referralUser.referralEarning || 0) + 100;

//         await Referral.create({
//           referrer: referralUser._id,
//           referredUser: user._id,
//           referralCode: payment.referralCode,
//           payment: payment._id,
//           reward: 100,
//           status: "completed",
//         });

//         await referralUser.save();
//       }
//     }

//     // 7. ACTIVATE BUSINESS PROFILE & FEATURES
//     const business = await Business.findOne({ user: user._id });
//     if (business) {
//       business.registrationStatus = "completed";
//       business.subscriptionStatus = "active";
//       business.profileUnlocked = true;
//       business.isActive = true;
//       await business.save();
//       payment.business = business._id;
//     }

//     await payment.save();
//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: "Payment verified successfully. Business profile activated!",
//       subscription: user.subscription,
//       referralCode: user.referralCode,
//       receiptNumber: payment.receiptNumber,
//       paymentId: payment._id,
//     });
//   } catch (error) {
//     console.error("VERIFY PAYMENT ERROR:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ======================================================
// // 3. REFUND PAYMENT API (Razorpay Refund Integration)
// // ======================================================
// exports.refundPayment = async (req, res) => {
//   try {
//     const { paymentId, amount, reason } = req.body;

//     const payment = await Payment.findById(paymentId);
//     if (!payment) {
//       return res.status(404).json({ success: false, message: "Payment transaction not found." });
//     }

//     if (payment.status !== "success") {
//       return res.status(400).json({ success: false, message: "Only successful payments can be refunded." });
//     }

//     const refundAmountInPaise = (amount || payment.amount) * 100;

//     // Issue Razorpay Refund
//     const refund = await razorpay.payments.refund(payment.paymentId, {
//       amount: refundAmountInPaise,
//       notes: { reason: reason || "Customer Requested Refund" },
//     });

//     payment.refundId = refund.id;
//     payment.refundStatus = "processed";
//     payment.refundAmount = amount || payment.amount;
//     payment.refundReason = reason || "Refund Processed";
//     payment.status = amount && amount < payment.amount ? "partially_refunded" : "refunded";

//     // De-activate User Subscription & Business
//     if (payment.status === "refunded") {
//       const user = await User.findById(payment.user);
//       if (user) {
//         user.subscription.status = "inactive";
//         await user.save();
//       }

//       const business = await Business.findOne({ user: payment.user });
//       if (business) {
//         business.subscriptionStatus = "inactive";
//         business.profileUnlocked = false;
//         await business.save();
//       }

//       // Revoke Referral Earning if applied
//       if (payment.referredBy) {
//         const referrer = await User.findById(payment.referredBy);
//         if (referrer) {
//           referrer.referralEarning = Math.max(0, (referrer.referralEarning || 0) - 100);
//           await referrer.save();
//         }
//         await Referral.findOneAndUpdate({ payment: payment._id }, { status: "revoked" });
//       }
//     }

//     await payment.save();

//     return res.status(200).json({
//       success: true,
//       message: "Refund initiated successfully.",
//       refundId: refund.id,
//       refundStatus: payment.refundStatus,
//     });
//   } catch (error) {
//     console.error("REFUND ERROR:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ======================================================
// // 4. REFERRAL DASHBOARD STATS (For Non-User Roles)
// // ======================================================
// exports.getReferralStats = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findById(userId).select("referralCode referralCount referralEarning role");

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     const referralsList = await Referral.find({ referrer: userId })
//       .populate("referredUser", "name email mobile role createdAt")
//       .sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       data: {
//         referralCode: user.referralCode || "N/A",
//         totalReferrals: user.referralCount || 0,
//         totalEarnings: user.referralEarning || 0,
//         currency: "INR",
//         history: referralsList,
//       },
//     });
//   } catch (error) {
//     console.error("GET REFERRAL STATS ERROR:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ======================================================
// // 5. GET RECEIPT
// // ======================================================
// exports.getReceipt = async (req, res) => {
//   try {
//     const { paymentId } = req.params;

//     const payment = await Payment.findById(paymentId).populate("user", "name email mobile role");

//     if (!payment) {
//       return res.status(404).json({ success: false, message: "Receipt not found" });
//     }

//     return res.status(200).json({
//       success: true,
//       receipt: {
//         receiptNumber: payment.receiptNumber,
//         paymentStatus: payment.status,
//         orderId: payment.orderId,
//         paymentId: payment.paymentId,
//         paymentMethod: payment.method,
//         planSelected: payment.planSelected,
//         amount: payment.amount,
//         currency: payment.currency,
//         refundAmount: payment.refundAmount || 0,
//         refundStatus: payment.refundStatus || null,
//         subscriptionStart: payment.subscriptionStart,
//         subscriptionEnd: payment.subscriptionEnd,
//         paymentDate: payment.createdAt,
//         referralCode: payment.referralCode || null,
//         customer: {
//           id: payment.user._id,
//           name: payment.user.name,
//           email: payment.user.email,
//           mobile: payment.user.mobile,
//           role: payment.user.role,
//         },
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };



const crypto = require("crypto");
const Referral = require("../models/Referral");
const razorpay = require("../config/razorpay");
const Payment = require("../models/Payment");
const User = require("../models/register");
const Business = require("../models/business");
const generateReceiptNumber = require("../utills/generateReceiptNumber");
const generateReferralCode = require("../utills/generateReferralCode");

// Plan Amounts and Durations Mapping
const PLAN_DETAILS = {
  "testing": { name: "Testing Plan", amount: 2, months: 0, days: 1 },
  "3month": { name: "3 Month", amount: 599, months: 3, days: 0 },
  "6months": { name: "6 Months", amount: 999, months: 6, days: 0 },
  "1year": { name: "1 Year", amount: 1599, months: 12, days: 0 },
};
const REFERRAL_REWARD = {
  "Testing Plan": 1,
  "3 Month": 84,
  "6 Months": 139,
  "1 Year": 224,
  "Free Plan": 0,
};
// Static Referral Codes Setup
const STATIC_REFERRAL_CODES = {
  FREE100: 0,       // ₹0 Free Access
  TO50: 299,        // Override to ₹299
  DISCOUNT599: 599, // Override to ₹599
};

// ======================================================
// 1. CREATE ORDER
// ======================================================
exports.createOrder = async (req, res) => {
  try {
    const { planKey, referralCode, email, mobile } = req.body;
    const userId = req.user.id;

    // 1. ROLE CHECK: Regular User Blocked
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (currentUser.role === "User" || currentUser.role === "user") {
      return res.status(403).json({
        success: false,
        message: "Payment features are restricted for standard user profiles.",
      });
    }

    // 2. PLAN SELECTION LOGIC
    let plan = PLAN_DETAILS[planKey ? planKey.toLowerCase() : "1year"];
    if (!plan) {
      return res.status(400).json({ success: false, message: "Invalid plan option selected." });
    }

    let finalAmount = plan.amount;
    const cleanReferralCode = referralCode ? referralCode.trim().toUpperCase() : null;

    // Static Discount Coupon Applied
    if (cleanReferralCode && STATIC_REFERRAL_CODES.hasOwnProperty(cleanReferralCode)) {
      finalAmount = STATIC_REFERRAL_CODES[cleanReferralCode];
    }

    // 3. UNIQUE EMAIL & MOBILE VALIDATION
    if (email) {
      const existingEmail = await User.findOne({ email: email.trim().toLowerCase(), _id: { $ne: userId } });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: "Email ID already exists with another user!" });
      }
    }

    if (mobile) {
      const existingMobile = await User.findOne({ mobile: mobile.trim(), _id: { $ne: userId } });
      if (existingMobile) {
        return res.status(400).json({ success: false, message: "Mobile number already registered with another user!" });
      }
    }

    // 4. REFERRAL CODE VALIDATION
    let referralUser = null;
    const isStaticReferral = cleanReferralCode && STATIC_REFERRAL_CODES.hasOwnProperty(cleanReferralCode);

    if (cleanReferralCode) {
      if (!isStaticReferral) {
        referralUser = await User.findOne({
          referralCode: { $regex: new RegExp(`^${cleanReferralCode}$`, "i") },
        });

        if (!referralUser) {
          return res.status(400).json({ success: false, message: "Invalid referral code" });
        }

        if (referralUser._id.toString() === userId.toString()) {
          return res.status(400).json({ success: false, message: "You cannot use your own referral code." });
        }

        if (referralUser.subscription?.status !== "active") {
          return res.status(400).json({ success: false, message: "Referral code owner does not have an active subscription." });
        }

        if (referralUser.subscription?.endDate && new Date(referralUser.subscription.endDate) < new Date()) {
          return res.status(400).json({ success: false, message: "Referral code has expired." });
        }
      }

      if (currentUser.referredBy) {
        return res.status(400).json({ success: false, message: "You have already applied a referral code earlier." });
      }
    }

    // 5. DIRECT ACTIVATION FOR ₹0 FREE SUBSCRIPTION
    if (finalAmount === 0) {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 6);

      const freePayment = await Payment.create({
        user: userId,
        orderId: `free_order_${Date.now()}`,
        paymentId: `FREE_PAY_${Date.now()}`,
        amount: 0,
        planSelected: "Free Plan",
        referralCode: cleanReferralCode,
        status: "success",
        method: "REFERRAL_FREE",
        receiptNumber: generateReceiptNumber(),
        subscriptionStart: startDate,
        subscriptionEnd: endDate,
      });

      currentUser.subscription = {
        status: "active",
        plan: "Free Plan",
        startDate,
        endDate,
      };

      if (!currentUser.referralCode) {
        currentUser.referralCode = generateReferralCode();
      }
      await currentUser.save();

      const business = await Business.findOne({ user: userId });
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
        subscription: currentUser.subscription,
      });
    }

    // 6. CREATE RAZORPAY ORDER FOR PAID PLANS
    const options = {
      amount: finalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      user: userId,
      orderId: order.id,
      amount: finalAmount,
      planSelected: plan.name,
      referralCode: cleanReferralCode,
      status: "created",
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
      planDetails: {
        key: planKey,
        name: plan.name,
        amount: finalAmount,
      },
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// 2. VERIFY PAYMENT & REWARD LOGIC
// ======================================================
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment details are required" });
    }

    // 1. VERIFY SIGNATURE
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // 2. FETCH PAYMENT & USER
    const payment = await Payment.findOne({ orderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment record not found" });
    }

    if (payment.status === "success") {
      return res.status(400).json({ success: false, message: "Payment already verified" });
    }

    const user = await User.findById(payment.user);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 3. FIND REFERRER USER (Case-Insensitive Match)
    let referralUser = null;
    if (payment.referralCode && !STATIC_REFERRAL_CODES.hasOwnProperty(payment.referralCode.trim().toUpperCase())) {
      referralUser = await User.findOne({
        referralCode: { $regex: new RegExp(`^${payment.referralCode.trim()}$`, "i") },
      });
    }

    // 4. RAZORPAY PAYMENT DETAILS FETCH
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.method = paymentDetails.method;
    payment.status = "success";
    payment.settlementStatus = "pending";
payment.settledAt = null;

    if (!payment.receiptNumber) {
      payment.receiptNumber = generateReceiptNumber();
    }

    const startDate = new Date();
    const endDate = new Date(startDate);

    if (payment.planSelected === "Testing Plan") {
      endDate.setDate(endDate.getDate() + 1);
    } else if (payment.planSelected === "1 Month") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (payment.planSelected === "6 Months") {
      endDate.setMonth(endDate.getMonth() + 6);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    payment.subscriptionStart = startDate;
    payment.subscriptionEnd = endDate;

    // 5. ACTIVATE USER SUBSCRIPTION FOR BUYER
    user.subscription = {
      status: "active",
      plan: payment.planSelected,
      startDate,
      endDate,
    };

    if (!user.referralCode) {
      user.referralCode = generateReferralCode();
    }

    // 6. 🎯 REWARD LOGIC: Credit ONLY to User A (Referrer), NOT User B (Buyer)
    if (referralUser && referralUser._id.toString() !== user._id.toString()) {
      const existingReferral = await Referral.findOne({ payment: payment._id });

      if (!existingReferral) {
        user.referredBy = referralUser._id;
        payment.referredBy = referralUser._id;

        // Credit ₹100 and +1 count ONLY to Referrer (User A)
        const reward =
REFERRAL_REWARD[payment.planSelected] || 0;
        referralUser.referralCount = (referralUser.referralCount || 0) + 1;
        referralUser.referralEarning = (referralUser.referralEarning || 0) + reward;

        await Referral.create({
          referrer: referralUser._id, // User A (Owner)
          referredUser: user._id,     // User B (Buyer)
          referralCode: payment.referralCode,
          payment: payment._id,
        reward: reward,
          status: "completed",
        });

        await referralUser.save();
      }
    }

    // 7. ACTIVATE BUSINESS PROFILE
    const business = await Business.findOne({ user: user._id });
    if (business) {
      business.registrationStatus = "completed";
      business.subscriptionStatus = "active";
      business.profileUnlocked = true;
      business.isActive = true;
      await business.save();
      payment.business = business._id;
    }

    await payment.save();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully. Business profile activated!",
      subscription: user.subscription,
      referralCode: user.referralCode,
      receiptNumber: payment.receiptNumber,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// 3. REFUND PAYMENT API (With Free Plan & Count Deduction Fix)
// ======================================================
exports.refundPayment = async (req, res) => {
  let payment = null;
  try {
    const { paymentId, amount, reason } = req.body;

    payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment transaction not found." });
    }

    if (payment.refundStatus === "processed" || payment.status === "refunded") {
      return res.status(400).json({ success: false, message: "Payment is already refunded." });
    }

    if (payment.status !== "success") {
      return res.status(400).json({ success: false, message: "Only successful payments can be refunded." });
    }

    const refundAmount = amount || payment.amount;

    // Free Plan Cancel Handling
    if (payment.amount === 0 || payment.method === "REFERRAL_FREE") {
      payment.refundId = `FREE_REFUND_${Date.now()}`;
      payment.refundStatus = "processed";
      payment.refundAmount = 0;
      payment.refundReason = reason || "Free Subscription Cancelled";
      payment.status = "refunded";
    } else {
      // Paid Razorpay Refund
      const refundAmountInPaise = refundAmount * 100;
      const refund = await razorpay.payments.refund(payment.paymentId, {
        amount: refundAmountInPaise,
        notes: { reason: reason || "Customer Requested Refund" },
      });

      payment.refundId = refund.id;
    
payment.refundRequestedAt = new Date();


      payment.refundStatus = "processed";
      payment.refundAmount = refundAmount;
      payment.refundReason = reason || "Refund Processed";
      payment.status = refundAmount < payment.amount ? "partially_refunded" : "refunded";
    }

    // Revoke Subscriptions & Earnings if fully refunded
    if (payment.status === "refunded") {
      const user = await User.findById(payment.user);
      if (user) {
        user.subscription.status = "inactive";
        await user.save();
      }

      const business = await Business.findOne({ user: payment.user });
      if (business) {
        business.subscriptionStatus = "cancelled";
        business.profileUnlocked = false;
        await business.save();
      }

      // Deduct both Earning and Count from Referrer (User A)
      if (payment.referredBy) {
        const referrer = await User.findById(payment.referredBy);
        if (referrer) {const reward =
REFERRAL_REWARD[payment.planSelected] || 0;
          referrer.referralEarning = Math.max(0, (referrer.referralEarning || 0) -reward);
          referrer.referralCount = Math.max(0, (referrer.referralCount || 0) - 1);
          await referrer.save();
        }
        await Referral.findOneAndUpdate({ payment: payment._id }, { status: "revoked" });
      }
    }

    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Refund processed successfully.",
      refundId: payment.refundId,
      refundStatus: payment.refundStatus,
    });
  } catch (error) {
    if (payment) {
    payment.refundStatus = "failed";
    await payment.save();
}
    console.error("REFUND ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// 4. REFERRAL DASHBOARD STATS
// ======================================================
exports.getReferralStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("referralCode referralCount referralEarning role");
    const payment = await Payment.findOne({
  user: userId,
}).sort({ createdAt: -1 });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const referralsList = await Referral.find({ referrer: userId })
      .populate("referredUser", "name email mobile role createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        referralCode: user.referralCode || "N/A",
        totalReferrals: user.referralCount || 0,
        totalEarnings: user.referralEarning || 0,
        currency: "INR",
        history: referralsList,


         payment: payment
    ? {
        status: payment.status,
        settlementStatus: payment.settlementStatus,
        refundStatus: payment.refundStatus,
        settledAt: payment.settledAt,
        refundRequestedAt: payment.refundRequestedAt,
        refundProcessedAt: payment.refundProcessedAt,
      }
    : null,

    referralRewards: {
  testing: 1,
  month3: 84,
  month6: 139,
  year1: 224,
},
      },
      
    });
  } catch (error) {
    console.error("GET REFERRAL STATS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// 5. GET RECEIPT
// ======================================================
exports.getReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId).populate("user", "name email mobile role");

    if (!payment) {
      return res.status(404).json({ success: false, message: "Receipt not found" });
    }

    return res.status(200).json({
      success: true,
      receipt: {
        receiptNumber: payment.receiptNumber,
        paymentStatus: payment.status,
        orderId: payment.orderId,
        paymentId: payment.paymentId,
        paymentMethod: payment.method,
        planSelected: payment.planSelected,
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
    return res.status(500).json({ success: false, message: error.message });
  }
};


exports.paymentWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];

const expectedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest("hex");

if (webhookSignature !== expectedSignature) {
  return res.status(400).json({
    success: false,
    message: "Invalid Webhook Signature",
  });
}
    console.log("Webhook Event:", req.body.event);
    console.log("Payload:", req.body);
    const event = req.body.event;

switch (event) {

  case "payment.captured":
    const paymentId = req.body.payload.payment.entity.id;

const payment = await Payment.findOne({
    paymentId,
});

if (payment) {
    payment.status = "success";
    await payment.save();
}
    break;

 case "refund.created": {

    const paymentId = req.body.payload.refund.entity.payment_id;

    const payment = await Payment.findOne({ paymentId });

    if (payment) {
        payment.refundStatus = "requested";
        payment.refundRequestedAt = new Date();

        await payment.save();
    }

    break;
}
    

case "refund.processed": {

    const paymentId = req.body.payload.refund.entity.payment_id;

    const payment = await Payment.findOne({ paymentId });

    if (payment) {

        payment.refundStatus = "processed";
        payment.refundProcessedAt = new Date();

        payment.status = "refunded";

        await payment.save();
    }

    break;
}

case "refund.failed": {

    const paymentId = req.body.payload.refund.entity.payment_id;

    const payment = await Payment.findOne({ paymentId });

    if (payment) {

        payment.refundStatus = "failed";

        await payment.save();
    }

    break;
}

case "settlement.processed": {

    const paymentId = req.body.payload.payment.entity.id;

    const payment = await Payment.findOne({ paymentId });

    if (payment) {

        payment.settlementStatus = "settled";
        payment.settledAt = new Date();

        await payment.save();
    }

    break;
}
}

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Webhook Error:", error);

    return res.status(500).json({
      success: false,
    });
  }
};