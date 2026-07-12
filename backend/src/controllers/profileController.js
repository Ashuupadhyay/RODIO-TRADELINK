const Profile = require("../models/profile");
const User = require("../models/register");

// GET PROFILE
const getProfile = async (req, res) => {
    try {

        const userId = req.user.id;

        // Register collection
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Profile collection
        const profile = await Profile.findOne({ user: userId });

        if (!profile) {

            return res.status(200).json({
                success: true,
                profile: {
                    role: user.role,
                    name: user.name,
                    email: user.email,
                    mobile: user.mobile,
                    profileImage: ""
                }
            });

        }

        return res.status(200).json({
            success: true,
            profile
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
    getProfile
};