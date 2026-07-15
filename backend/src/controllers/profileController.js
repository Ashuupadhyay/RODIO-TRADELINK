const Profile = require("../models/profile");
const User = require("../models/register");
// GET API
// Default Profile Image
const DEFAULT_PROFILE_IMAGE =
  "https://res.cloudinary.com/tyt9mt1f/image/upload/v1784103262/DUMMYIMAGE_xuc0xa.jpg";

// GET PROFILE
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user from Register collection
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find profile
    const profile = await Profile.findOne({ user: userId });

    // If profile does not exist
    if (!profile) {
      return res.status(200).json({
        success: true,
        profile: {
          role: user.role,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          profileImage: DEFAULT_PROFILE_IMAGE,
        },
      });
    }

    // If profile exists
    return res.status(200).json({
      success: true,
      profile: {
        ...profile.toObject(),
        profileImage:
          profile.profileImage || DEFAULT_PROFILE_IMAGE,
      },
    });

  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getProfile,
};