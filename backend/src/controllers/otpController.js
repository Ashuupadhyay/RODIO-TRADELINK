const { sendOTP, verifyOTP } = require("../services/msg91Service");

// ===========================
// SEND OTP
// ===========================
exports.sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    const response = await sendOTP(mobile);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      data: response,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

// ===========================
// VERIFY OTP
// ===========================
exports.verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: "Mobile and OTP are required",
      });
    }

    const response = await verifyOTP(mobile, otp);

    return res.status(200).json({
      success: true,
      message: "OTP Verified Successfully",
      data: response,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  }
};