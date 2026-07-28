const Payment = require("../models/Payment");

// ==========================================
// GET LATEST RECEIPT
// ==========================================

exports.getLatestReceipt = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      user: req.user.id,
      status: "success",
    })
      .sort({ createdAt: -1 })
      .populate("user", "mobile role");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "No receipt found",
      });
    }

    return res.status(200).json({
      success: true,
      receipt: {
        paymentId: payment._id,
        receiptNumber: payment.receiptNumber,
        orderId: payment.orderId,
        razorpayPaymentId: payment.paymentId,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        paymentStatus: payment.status,
        paymentDate: payment.createdAt,
        subscriptionStart: payment.subscriptionStart,
        subscriptionEnd: payment.subscriptionEnd,
        customer: {
          mobile: payment.user.mobile,
          role: payment.user.role,
        },
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};