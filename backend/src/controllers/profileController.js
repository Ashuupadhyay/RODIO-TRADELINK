const Profile = require("../models/profile");
const User = require("../models/register");
const cloudinary = require("../config/cloudnary");
const streamifier = require("streamifier");
const bcrypt = require("bcrypt");


//poat 


// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name, email, phoneNumber, password } = req.body;
    console.log("name is",name);
    console.log("email is ",email);;
    console.log("phonenumber is ",phoneNumber);

    // Current User
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check Duplicate Email
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: userId },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }
    }

    // Check Duplicate Mobile
    if (phoneNumber && phoneNumber !== user.mobile) {
      const existingMobile = await User.findOne({
        mobile: phoneNumber,
        _id: { $ne: userId },
      });

      if (existingMobile) {
        return res.status(400).json({
          success: false,
          message: "Mobile number already registered",
        });
      }
    }

    let imageUrl = "";

    // Upload Image to Cloudinary
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
      console.log("imageurl",imageUrl);
    }

    // Update User Collection
    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber) user.mobile = phoneNumber;
    if (password && password.trim() !== "") {
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
}
    console.log("update name",name);
    console.log("updated email",email);
    console.log("numberupdated",phoneNumber);

    await user.save();

    // Find Profile
    let profile = await Profile.findOne({ user: userId });
    console.log("imageupfayhdbhbc",profile);

    // Create Profile if not exists
    if (!profile) {
      profile = await Profile.create({
        user: userId,
        role: user.role,
        name: user.name,
        email: user.email,
        phoneNumber: user.mobile,
        profileImage: imageUrl,
      });
    } else {
      profile.name = user.name;
      profile.email = user.email;
      profile.phoneNumber = user.mobile;

      if (imageUrl) {
        profile.profileImage = imageUrl;
      }

      await profile.save();
    }

    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      profile,
    });

  } catch (error) {
    console.log("Update Profile Error:", error);
   console.log("error",error);
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