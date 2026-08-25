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
const Business = require("../models/business");
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
    if (updateData.firmName) user.firmName = updateData.firmName;

    if (updateData.password && updateData.password.trim() !== "") {
      user.password = await bcrypt.hash(updateData.password, 10);
      delete updateData.password;
    }

    await user.save();
// ==========================================
// UPDATE BUSINESS CONTACT DETAILS
// ==========================================



// let business = await Business.findOne({
//   user: userId,
// });

// if (business) {
//   // WhatsApp Number
//   if (updateData.whatsappNumber !== undefined) {
//     business.whatsappNumber =
//       String(updateData.whatsappNumber).trim();
//   }

//   // Alternative Numbers
//   if (updateData.alternatePhoneNumbers !== undefined) {
//     business.alternatePhoneNumbers =
//       Array.isArray(updateData.alternatePhoneNumbers)
//         ? updateData.alternatePhoneNumbers
//             .map((num) => String(num).trim())
//             .filter(Boolean)
//         : [];
//   }

//   await business.save();
// }

// ==========================================
// UPDATE BUSINESS PROFILE DETAILS
// ==========================================

let business = await Business.findOne({
  user: userId,
});

if (business) {

  // ==========================================
  // ROLE / CATEGORY
  // ==========================================

  if (updateData.role !== undefined) {
    business.category = String(updateData.role).trim();
  }

  if (updateData.category !== undefined) {
    business.category = String(updateData.category).trim();
  }

  // ==========================================
  // NAME
  // ==========================================

  if (updateData.name !== undefined) {
    business.name = String(updateData.name).trim();
  }

  // ==========================================
  // FIRM NAME
  // ==========================================

  if (updateData.firmName !== undefined) {
    business.firmName = String(updateData.firmName).trim();
  }

  // ==========================================
  // MOBILE NUMBER
  // ==========================================

  if (updateData.phoneNumber !== undefined) {
    business.phoneNumber =
      String(updateData.phoneNumber).trim();
  }

  if (updateData.mobile !== undefined) {
    business.phoneNumber =
      String(updateData.mobile).trim();
  }

  // ==========================================
  // ALTERNATE MOBILE NUMBERS
  // ==========================================

  if (updateData.alternatePhoneNumbers !== undefined) {
    business.alternatePhoneNumbers =
      Array.isArray(updateData.alternatePhoneNumbers)
        ? updateData.alternatePhoneNumbers
            .map((num) => String(num).trim())
            .filter(Boolean)
        : [];
  }

  // ==========================================
  // WHATSAPP NUMBER
  // ==========================================

  if (updateData.whatsappNumber !== undefined) {
    business.whatsappNumber =
      String(updateData.whatsappNumber).trim();
  }

  // ==========================================
  // EMAIL
  // ==========================================

  if (updateData.email !== undefined) {
    business.email =
      String(updateData.email).trim().toLowerCase();
  }

  // ==========================================
  // MAIN ADDRESS
  // ==========================================

  if (updateData.address !== undefined) {
    business.address =
      String(updateData.address).trim();
  }

  // ==========================================
  // MULTIPLE OFFICE ADDRESSES
  // ==========================================

  if (updateData.addresses !== undefined) {
    business.addresses =
      Array.isArray(updateData.addresses)
        ? updateData.addresses
            .map((address) => String(address).trim())
            .filter(Boolean)
        : [];
  }

  // ==========================================
  // OFFICE LANDLINE NUMBERS
  // ==========================================

  if (updateData.landlineNumbers !== undefined) {
    business.landlineNumbers =
      Array.isArray(updateData.landlineNumbers)
        ? updateData.landlineNumbers
            .map((number) => String(number).trim())
            .filter(Boolean)
        : [];
  }

  // ==========================================
  // WEBSITE
  // ==========================================

  if (updateData.website !== undefined) {
    business.website =
      String(updateData.website).trim();
  }

  // ==========================================
  // EMPLOYEE RANGE
  // ==========================================

  if (updateData.employeeRange !== undefined) {
    business.employeeRange =
      String(updateData.employeeRange).trim();
  }

  // ==========================================
  // OFFICE WORKING HOURS
  // ==========================================

  if (updateData.officeWorkingHours !== undefined) {
    business.officeWorkingHours = {
      start:
        updateData.officeWorkingHours?.start || "",

      end:
        updateData.officeWorkingHours?.end || "",
    };
  }

  // ==========================================
  // OFFICE WORKING DAYS
  // ==========================================

  if (updateData.officeWorkingDays !== undefined) {
    business.officeWorkingDays =
      Array.isArray(updateData.officeWorkingDays)
        ? updateData.officeWorkingDays
            .map((day) => String(day).trim())
            .filter(Boolean)
        : [];
  }

  // ==========================================
  // CITY
  // ==========================================

  if (updateData.currentCity !== undefined) {
    business.currentCity =
      String(updateData.currentCity).trim();
  }

  // ==========================================
  // STATE
  // ==========================================

  if (updateData.currentState !== undefined) {
    business.currentState =
      String(updateData.currentState).trim();
  }

  // ==========================================
  // PINCODE
  // ==========================================

  if (updateData.pincode !== undefined) {
    business.pincode =
      String(updateData.pincode).trim();
  }

  // ==========================================
  // WORKING AREAS
  // ==========================================

  if (updateData.workingAreas !== undefined) {
    business.workingAreas =
      updateData.workingAreas;
  }

  // ==========================================
  // DIRECTORY STATUS
  // ==========================================

  business.registrationStatus = "completed";
  business.isActive = true;

  await business.save();
}



    // 6. Update or Create Profile Collection Dynamically
    if (imageUrl) {
      updateData.profileImage = imageUrl;
    }

    if (phoneNumber) {
      updateData.phoneNumber = String(phoneNumber);
      updateData.mobile = String(phoneNumber);
    }

    updateData.user = userId;
    updateData.role =
  updateData.role !== undefined
    ? updateData.role
    : user.role;
    updateData.name = user.name || "";
updateData.firmName = user.firmName || "";
updateData.email = user.email || "";
updateData.phoneNumber = user.mobile || "";

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
  //     profile: {
  //   ...profile.toObject(),

  //   alternatePhoneNumbers:
  //     business?.alternatePhoneNumbers || [],

  //   whatsappNumber:
  //     business?.whatsappNumber || "",
  // }
  
  
  profile: {
  ...profile.toObject(),

  role:
    business?.category ||
    user.role ||
    "",

  name:
    business?.name ||
    user.name ||
    "",

  firmName:
    business?.firmName ||
    user.firmName ||
    "",

  phoneNumber:
    business?.phoneNumber ||
    user.mobile ||
    "",

  mobile:
    business?.phoneNumber ||
    user.mobile ||
    "",

  email:
    business?.email ||
    user.email ||
    "",

  alternatePhoneNumbers:
    business?.alternatePhoneNumbers || [],

  whatsappNumber:
    business?.whatsappNumber || "",

  address:
    business?.address || "",

  addresses:
    business?.addresses || [],

  landlineNumbers:
    business?.landlineNumbers || [],

  currentCity:
    business?.currentCity || "",

  currentState:
    business?.currentState || "",

  pincode:
    business?.pincode || "",

  website:
    business?.website || "",

  employeeRange:
    business?.employeeRange || "",

  officeWorkingHours:
    business?.officeWorkingHours || {
      start: "",
      end: "",
    },

  officeWorkingDays:
    business?.officeWorkingDays || [],

  workingAreas:
    business?.workingAreas || [],

  profileImage:
    profile.profileImage ||
    DEFAULT_PROFILE_IMAGE,
},
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
    const business = await Business.findOne({ user: userId }).lean();

    // Profile nahi hai

    
    if (!profile) {
      return res.status(200).json({
        success: true,

        
        // profile: {
        //   role: user.role || "",
        //   name: user.name || "",
        //   email: user.email || "",
        //   firmName: user.firmName || "",
        //   mobile: user.mobile || "",
        //   phoneNumber: user.mobile || "",

        //   // Business fields
        //   alternatePhoneNumbers:
        //     business?.alternatePhoneNumbers || [],

        //   whatsappNumber:
        //     business?.whatsappNumber || "",

        //   profileImage: DEFAULT_PROFILE_IMAGE,
        // },
        profile: {
  role:
    business?.category ||
    user.role ||
    "",

  name:
    business?.name ||
    user.name ||
    "",

  email:
    business?.email ||
    user.email ||
    "",

  firmName:
    business?.firmName ||
    user.firmName ||
    "",

  mobile:
    business?.phoneNumber ||
    user.mobile ||
    "",

  phoneNumber:
    business?.phoneNumber ||
    user.mobile ||
    "",

  alternatePhoneNumbers:
    business?.alternatePhoneNumbers || [],

  whatsappNumber:
    business?.whatsappNumber || "",

  address:
    business?.address || "",

  addresses:
    business?.addresses || [],

  landlineNumbers:
    business?.landlineNumbers || [],

  currentCity:
    business?.currentCity || "",

  currentState:
    business?.currentState || "",

  pincode:
    business?.pincode || "",

  website:
    business?.website || "",

  employeeRange:
    business?.employeeRange || "",

  officeWorkingHours:
    business?.officeWorkingHours || {
      start: "",
      end: "",
    },

  officeWorkingDays:
    business?.officeWorkingDays || [],

  workingAreas:
    business?.workingAreas || [],

  profileImage: DEFAULT_PROFILE_IMAGE,
},
      });
    }

    // Profile + Business data
    return res.status(200).json({
      success: true,
      profile: {
  ...profile.toObject(),

  role:
    business?.category ||
    user.role ||
    "",

  name:
    business?.name ||
    profile.name ||
    user.name ||
    "",

  firmName:
    business?.firmName ||
    profile.firmName ||
    user.firmName ||
    "",

  email:
    business?.email ||
    profile.email ||
    user.email ||
    "",

  phoneNumber:
    business?.phoneNumber ||
    user.mobile ||
    "",

  mobile:
    business?.phoneNumber ||
    user.mobile ||
    "",

  alternatePhoneNumbers:
    business?.alternatePhoneNumbers || [],

  whatsappNumber:
    business?.whatsappNumber || "",

  address:
    business?.address || "",

  addresses:
    business?.addresses || [],

  landlineNumbers:
    business?.landlineNumbers || [],

  currentCity:
    business?.currentCity || "",

  currentState:
    business?.currentState || "",

  pincode:
    business?.pincode || "",

  website:
    business?.website || "",

  employeeRange:
    business?.employeeRange || "",

  officeWorkingHours:
    business?.officeWorkingHours || {
      start: "",
      end: "",
    },

  officeWorkingDays:
    business?.officeWorkingDays || [],

  workingAreas:
    business?.workingAreas || [],

  profileImage:
    profile.profileImage ||
    DEFAULT_PROFILE_IMAGE,
},
    });

  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      success: false,
      message:
        "We couldn't process your request at the moment. Please try again later.",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};