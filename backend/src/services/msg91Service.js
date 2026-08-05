const axios = require("axios");

const AUTH_KEY = process.env.MSG91_AUTH_KEY;

// ==============================
// SEND OTP
// ==============================
const sendOTP = async (mobile) => {
  try {
    const response = await axios.post(
      "https://control.msg91.com/api/v5/otp",
      {
        mobile: `91${mobile}`,
        template_id: process.env.MSG91_TEMPLATE_ID,
      },
      {
        headers: {
          authkey: AUTH_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "MSG91 Send OTP Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==============================
// VERIFY OTP
// ==============================
const verifyOTP = async (mobile, otp) => {
  try {
    const response = await axios.post(
      "https://control.msg91.com/api/v5/otp/verify",
      {
        mobile: `91${mobile}`,
        otp,
      },
      {
        headers: {
          authkey: AUTH_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "MSG91 Verify OTP Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
};