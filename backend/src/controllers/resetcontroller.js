const bcrypt = require("bcrypt");
const User = require("../models/register");
const OTP = require("../models/otpmodel");

const resetPassword = async (req, res) => {

    try {

        const {
            email,
            otp,
            password,
            confirmPassword
        } = req.body;

        if (
            !email ||
            !otp ||
            !password ||
            !confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        const otpRecord = await OTP.findOne({ email });
              console.log(otpRecord);
        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "OTP not found"
            });
        }

        if (otpRecord.expiresAt < new Date()) {

            await OTP.deleteOne({ email });

            return res.status(400).json({
                success: false,
                message: "OTP expired"
            });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findOneAndUpdate(
            { email },
            {
                password: hashedPassword
            }
        );

        await OTP.deleteOne({ email });

        return res.status(200).json({
            success: true,
            message: "Password Updated Successfully"
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

module.exports ={ resetPassword};