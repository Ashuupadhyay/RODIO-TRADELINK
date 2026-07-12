const axios = require("axios");

const sendSMS = async (mobile, otp) => {
    try {

        // Mobile ko 91 ke saath convert karo
        mobile = mobile.replace(/^(\+91|91)?/, "91");

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

        console.log("SMS Sent Successfully", response.data);

    } catch (err) {
        console.log("SMS Error:", err.response?.data || err.message);
        throw err;
    }
};

module.exports = sendSMS;