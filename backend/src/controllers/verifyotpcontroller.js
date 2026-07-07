const User = require("../models/register");
const OTP = require("../models/otpmodel");

const verifyOTP = async (req, res) => {
    try {

        const { email, otp } = req.body;
        console.log("Email:", email);
        console.log("OTP:", otp);

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }
        const allOtps = await OTP.find();

console.log("All OTPs:", allOtps);

        const otpRecord = await OTP.findOne({ email });
        console.log("OTP Record:", otpRecord);

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "OTP not found. Please request a new OTP."
            });
        }

        if (otpRecord.expiresAt < new Date()) {

            await OTP.deleteOne({ email });

            return res.status(400).json({
                success: false,
                message: "OTP has expired."
            });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP Verified Successfully"
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};

module.exports = {verifyOTP};