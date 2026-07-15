const Profile = require("../models/profile");
const User = require("../models/register");
const cloudinary = require("../config/cloudnary");
const streamifier = require("streamifier");


//poat 


// UPDATE PROFILE

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name, phoneNumber } = req.body;

    // Registered User
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let imageUrl = "";

    // Image Upload
    if (req.file) {
      const uploadImage = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "profiles",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

      const result = await uploadImage();

      imageUrl = result.secure_url;
    }

    // Profile Find
    let profile = await Profile.findOne({ user: userId });

    if (!profile) {
      profile = await Profile.create({
        user: userId,
        role: user.role,
        name: name || user.name,
        email: user.email,
        phoneNumber: phoneNumber || user.mobile,
        profileImage: imageUrl,
      });
    } else {
      if (name) profile.name = name;

      if (phoneNumber) profile.phoneNumber = phoneNumber;

      if (imageUrl) profile.profileImage = imageUrl;

      await profile.save();
    }

    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      profile,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
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
  updateProfile,

};