const Profile = require("../models/profile");
const User = require("../models/register");
const cloudinary = require("../config/cloudnary");
const streamifier = require("streamifier");
const bcrypt = require("bcrypt");

const DEFAULT_PROFILE_IMAGE =
  "https://res.cloudinary.com/tyt9mt1f/image/upload/v1784103262/DUMMYIMAGE_xuc0xa.jpg";

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name, email, phoneNumber, password } = req.body;

    // ===========================
    // Find User
    // ===========================
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ===========================
    // Duplicate Email Check
    // ===========================
    if (email && email !== user.email) {
      const emailExist = await User.findOne({
        email,
        _id: { $ne: userId },
      });

      if (emailExist) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // ===========================
    // Duplicate Mobile Check
    // ===========================
    if (phoneNumber && phoneNumber !== user.mobile) {
      const mobileExist = await User.findOne({
        mobile: phoneNumber,
        _id: { $ne: userId },
      });

      if (mobileExist) {
        return res.status(400).json({
          success: false,
          message: "Mobile number already exists",
        });
      }
    }

    // ===========================
    // Upload Image
    // ===========================
    let imageUrl = "";

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

    // ===========================
    // Update User
    // ===========================
    if (name) user.name = name;

    if (email) user.email = email;

    if (phoneNumber) user.mobile = phoneNumber;

    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    // ===========================
    // Find Profile
    // ===========================
    let profile = await Profile.findOne({ user: userId });

    // ===========================
    // Create Profile
    // ===========================
    if (!profile) {
      profile = new Profile({
        user: userId,
        role: user.role,
        name: user.name,
        email: user.email,
        phoneNumber: user.mobile,
        profileImage: imageUrl || DEFAULT_PROFILE_IMAGE,
      });

      await profile.save();
    }

    // ===========================
    // Update Existing Profile
    // ===========================
    else {
      if (name) profile.name = user.name;

      if (email) profile.email = user.email;

      if (phoneNumber) profile.phoneNumber = user.mobile;

      if (imageUrl) profile.profileImage = imageUrl;

      await profile.save();
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  updateProfile,
};