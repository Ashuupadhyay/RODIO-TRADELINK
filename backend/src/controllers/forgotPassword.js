const User = require("../models/register");
const OTP = require("../models/otpmodel");
const sendEmail = require("../utills/sendemail");
const axios = require("axios");

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const forgotPassword = async (req, res) => {
    try {

        const { email, mobilenum } = req.body;

        // 1. Check user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not registered"
            });
        }

        // 2. Delete old OTP if exists
        await OTP.findOneAndDelete({ email });

        // 3. Generate OTP
        const otp = generateOTP();

        // 4. Save OTP
        await OTP.create({
            email,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 Minutes
        });

        // 5. Send Email
        await sendEmail(
            email,
            "Rodio Password Reset OTP",
            `
            <h2>Hello ${user.name}</h2>

            <p>We received a request to reset your password.</p>

            <h1 style="letter-spacing:4px;color:#0c30c8;">
                ${otp}
            </h1>

            <p>This OTP is valid for <b>10 Minutes</b>.</p>

            <p>If you didn't request this, please ignore this email.</p>

            <br>

            <p>Regards,</p>
            <b>Team Rodio</b>
            `
        );

        // 6. Send Mobile OTP (Optional)
       const axios = require("axios");

if (mobilenum) {
    try {
        await axios.get(
            `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${mobilenum}/${otp}`
        );

        console.log("SMS Sent");

    } catch (err) {
        console.log("SMS Error:", err.response?.data || err.message);
    }
}

        return res.status(200).json({
            success: true,
            message: "OTP Sent Successfully"
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};

module.exports = {
    forgotPassword
};