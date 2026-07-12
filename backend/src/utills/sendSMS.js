const axios = require("axios");

const sendSMS = async (mobile, otp) => {
    try {
        const response = await axios.post(
            "https://api.brevo.com/v3/transactionalSMS/sms",
            {
                sender: process.env.SMS_SENDER,
                recipient: mobile,
                content: `Your RODIO OTP is ${otp}. It is valid for 10 minutes.`
            },
            {
                headers: {
                    "api-key": process.env.BREVO_API_KEY,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            }
        );

        console.log("SMS Sent:", response.data);

    } catch (error) {
        console.log("SMS Error:", error.response?.data || error.message);
    }
};

module.exports = sendSMS;