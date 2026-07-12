const OTP = require("../models/otpmodel");

const verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;

        console.log("OTP:", otp);

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is required"
            });
        }

        // OTP se record find karo
        const otpRecord = await OTP.findOne({ otp });

        console.log("OTP Record:", otpRecord);

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // Expiry check
        if (otpRecord.expiresAt < new Date()) {
            await OTP.deleteOne({ _id: otpRecord._id });

            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        // Verify successful
        return res.status(200).json({
            success: true,
            message: "OTP Verified Successfully",
            email: otpRecord.email // agar baad me email chahiye to
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = { verifyOTP };