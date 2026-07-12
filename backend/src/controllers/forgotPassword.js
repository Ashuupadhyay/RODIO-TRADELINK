const User = require("../models/register");
const OTP = require("../models/otpmodel");
const sendEmail = require("../services/emailService");
const sendSMS = require("../services/smsService");

// Generate 6 Digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const forgotPassword = async (req, res) => {
    try {

        const { email } = req.body;

        // Check Email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // Find User
        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not registered"
            });
        }

        // Delete Old OTP
        await OTP.findOneAndDelete({ email: user.email });

        // Generate OTP
        const otp = generateOTP();

        // Save OTP
        await OTP.create({
            email: user.email,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 Minutes
        });

        // Send Email
        await sendEmail(
            user.email,
            "Rodio Password Reset OTP",
            `
            <h2>Hello ${user.name}</h2>

            <p>We received a request to reset your password.</p>

            <p>Please use the OTP below to reset your password.</p>

            <h1 style="letter-spacing:5px;color:#0c30c8;">
                ${otp}
            </h1>

            <p>This OTP is valid for <b>10 Minutes</b>.</p>

            <p>If you didn't request this password reset, please ignore this email.</p>

            <br>

            <p>Regards,</p>
            <b>Team Rodio</b>
            `
        );

        // Send SMS (Optional)
        try {

            await sendSMS(user.mobile, otp);

            console.log("SMS Sent Successfully");

        } catch (smsError) {

            console.log(
                "SMS Failed:",
                smsError.response?.data || smsError.message
            );

            // Email already sent, so continue
        }

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully. Please check your email."
        });

    } catch (error) {

        console.log(
            "Forgot Password Error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};

module.exports = {
    forgotPassword
};