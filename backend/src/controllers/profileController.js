// const Profile = require("../models/profile");
// const User = require("../models/register");
// const cloudinary = require("../config/cloudnary");
// const streamifier = require("streamifier");
// const bcrypt = require("bcrypt");

// const DEFAULT_PROFILE_IMAGE =
//   "https://res.cloudinary.com/tyt9mt1f/image/upload/v1784103262/DUMMYIMAGE_xuc0xa.jpg";

// // UPDATE PROFILE (Dynamic for User, Transporter, Broker - Single or Multi Field)
// const updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const updateData = { ...req.body }; // Captures any single or multiple field sent from frontend

//     // 1. Find User
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // 2. Duplicate Email Check (Only if email is passed & changed)
//     if (updateData.email && updateData.email !== user.email) {
//       const emailExist = await User.findOne({
//         email: updateData.email,
//         _id: { $ne: userId },
//       });

//       if (emailExist) {
//         return res.status(400).json({
//           success: false,
//           message: "Email already exists",
//         });
//       }
//     }

//     // 3. Duplicate Mobile Check (Only if mobile is passed & changed)
//     const phoneNumber = updateData.phoneNumber || updateData.mobile;
//     if (phoneNumber && phoneNumber !== user.mobile) {
//       const mobileExist = await User.findOne({
//         mobile: phoneNumber,
//         _id: { $ne: userId },
//       });

//       if (mobileExist) {
//         return res.status(400).json({
//           success: false,
//           message: "Mobile number already exists",
//         });
//       }
//     }

//     // 4. Upload Profile Image to Cloudinary (If File Provided)
//     let imageUrl = "";
//     if (req.file) {
//       const uploadImage = () =>
//         new Promise((resolve, reject) => {
//           const stream = cloudinary.uploader.upload_stream(
//             { folder: "profiles" },
//             (error, result) => {
//               if (error) reject(error);
//               else resolve(result);
//             }
//           );
//           streamifier.createReadStream(req.file.buffer).pipe(stream);
//         });

//       const result = await uploadImage();
//       imageUrl = result.secure_url;
//     }

//     // 5. Update Base User Collection
//     if (updateData.name) user.name = updateData.name;
//     if (updateData.email) user.email = updateData.email;
//     if (phoneNumber) user.mobile = phoneNumber;

//     if (updateData.password && updateData.password.trim() !== "") {
//       user.password = await bcrypt.hash(updateData.password, 10);
//       delete updateData.password;
//     }

//     await user.save();

//     // 6. Update or Create Profile Collection Dynamically
//     if (imageUrl) {
//       updateData.profileImage = imageUrl;
//     }

//     if (phoneNumber) {
//       updateData.phoneNumber = phoneNumber;
//       updateData.mobile = phoneNumber;
//     }

//     updateData.user = userId;
//     updateData.role = user.role;

//     let profile = await Profile.findOne({ user: userId });

//     if (!profile) {
//       profile = new Profile({
//         ...updateData,
//         profileImage: imageUrl || DEFAULT_PROFILE_IMAGE,
//       });
//       await profile.save();
//     } else {
//       // Direct Assigns all fields dynamically without validation block
//       Object.assign(profile, updateData);
//       await profile.save();
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Profile updated successfully",
//       profile,
//     });
//   } catch (error) {
//     console.error("Update Profile Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // GET PROFILE
// const getProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const user = await User.findById(userId).select("-password");

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const profile = await Profile.findOne({ user: userId });

//     if (!profile) {
//       return res.status(200).json({
//         success: true,
//         profile: {
//           role: user.role,
//           name: user.name,
//           email: user.email,
//           mobile: user.mobile,
//           profileImage: DEFAULT_PROFILE_IMAGE,
//         },
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       profile: {
//         ...profile.toObject(),
//         profileImage: profile.profileImage || DEFAULT_PROFILE_IMAGE,
//       },
//     });
//   } catch (error) {
//     console.error("Get Profile Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };

// module.exports = {
//   getProfile,
//   updateProfile,
// };
const Profile = require("../models/profile");
const User = require("../models/register");
const cloudinary = require("../config/cloudnary");
const streamifier = require("streamifier");
const bcrypt = require("bcrypt");

const DEFAULT_PROFILE_IMAGE =
  "https://res.cloudinary.com/tyt9mt1f/image/upload/v1784103262/DUMMYIMAGE_xuc0xa.jpg";

// UPDATE PROFILE (Dynamic for User, Transporter, Broker - Single or Multi Field)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = { ...req.body }; // Captures any single or multiple field sent from frontend

    // 1. Find User
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. Duplicate Email Check (Only if email is passed & changed)
    if (updateData.email && updateData.email !== user.email) {
      const emailExist = await User.findOne({
        email: updateData.email,
        _id: { $ne: userId },
      });

      if (emailExist) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // 3. Duplicate Mobile Check (Only if mobile is passed & changed)
    const phoneNumber = updateData.phoneNumber || updateData.mobile;
    if (phoneNumber && String(phoneNumber) !== String(user.mobile)) {
      const mobileExist = await User.findOne({
        mobile: String(phoneNumber),
        _id: { $ne: userId },
      });

      if (mobileExist) {
        return res.status(400).json({
          success: false,
          message: "Mobile number already exists",
        });
      }
    }

    // 4. Upload Profile Image to Cloudinary (If File Provided)
    let imageUrl = "";
    if (req.file) {
      const uploadImage = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "profiles" },
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

    // 5. Update Base User Collection
    if (updateData.name) user.name = updateData.name;
    if (updateData.email) user.email = updateData.email;
    if (phoneNumber) user.mobile = String(phoneNumber);

    if (updateData.password && updateData.password.trim() !== "") {
      user.password = await bcrypt.hash(updateData.password, 10);
      delete updateData.password;
    }

    await user.save();

    // 6. Update or Create Profile Collection Dynamically
    if (imageUrl) {
      updateData.profileImage = imageUrl;
    }

    if (phoneNumber) {
      updateData.phoneNumber = String(phoneNumber);
      updateData.mobile = String(phoneNumber);
    }

    updateData.user = userId;
    updateData.role = user.role;

    let profile = await Profile.findOne({ user: userId });

    if (!profile) {
      profile = new Profile({
        ...updateData,
        profileImage: imageUrl || DEFAULT_PROFILE_IMAGE,
      });
      await profile.save();
    } else {
      // Direct Assigns all fields dynamically without validation block
      Object.assign(profile, updateData);
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

// GET PROFILE
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profile = await Profile.findOne({ user: userId });

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

    return res.status(200).json({
      success: true,
      profile: {
        ...profile.toObject(),
        profileImage: profile.profileImage || DEFAULT_PROFILE_IMAGE,
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "We couldn't process your request at the moment. Please try again later. If the problem continues, contact our support team.",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};