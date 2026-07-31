//const sendEmail = require("../utills/sendemail");
const User = require("../models/register");
const OTP = require("../models/otpmodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Business = require("../models/business");

// REGISTER
const register = async (req, res) => {
    try {
        const { role, mobile, password, confirmPassword } = req.body;
        
        console.log(role);
        console.log(mobile);
        console.log(password);
        console.log(confirmPassword);

        // Required fields check (Name & Email removed)
        if (!role || !mobile || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }

        // Indian Mobile Validation
        const mobileRegex = /^[6-9]\d{9}$/;

        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid Indian mobile number"
            });
        }

        // Duplicate Check (Only for Mobile)
       /*const existingUser = await User.findOne({
            mobile: mobile.replace(/^(\+91|91)/, "")
        });
*/
const existingUser = await User.findOne({
    mobile
});
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Mobile number is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // User save (Name & Email removed)
        const user = new User({
            role,
           mobile,
            password: hashedPassword
        });

        await user.save();
        console.log("successfully registered");

        // Token Generation
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE,
            }
        );
        console.log(token);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            success: true,
            message: "Registration Successful",
            token,
            redirectTo: "/dashboard",
            user: {
                id: user._id,
                role: user.role,
                mobile: user.mobile
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "We couldn't process your request at the moment. Please try again later. If the problem continues, contact our support team." });
    }
};


// LOGIN
const login = async (req, res) => {
    try {
        const { emailOrMobile, password } = req.body;
        console.log("data k pehle check");
        console.log(emailOrMobile);
        console.log(password);

        if (!emailOrMobile || !password) {
            return res.status(400).json({
                success: false,
                message: "Mobile and Password are required"
            });
        }

        // User Find (By Mobile)
        const user = await User.findOne({
            $or: [
                { email: emailOrMobile.toLowerCase() }, // Safe fall-back if older records exist
                { mobile: emailOrMobile }
            ]
        });

        console.log("user check:", user);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not registered"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Wrong Password"
            });
        }

        // JWT Generate
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE
            }
        );

        let redirectTo = "/dashboard";

        // Cookie save
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        let businessId = null;

        if (user.role === "broker" || user.role === "transporter") {
            const business = await Business.findOne({
                user: user._id,
            });
            if (business) {
                businessId = business._id;
            }
        }

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            redirectTo,
            businessId,
            user: {
                id: user._id,
                role: user.role,
                mobile: user.mobile
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "We couldn't process your request at the moment. Please try again later. If the problem continues, contact our support team."
        });
    }
};


// LOGOUT
const logout = (req, res) => {
    res.clearCookie("token");
    return res.status(200).json({
        success: true,
        message: "Logout Successful"
    });
};


// EXPORTS
module.exports = {
    register,
    login,
    logout
};