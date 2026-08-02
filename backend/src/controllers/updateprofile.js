// const Business = require("../models/business");

// exports.updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     console.log("Logged in User ID:", userId);

//     // Current user ka business find karo
//     let business = await Business.findOne({ user: userId });

//     // Agar business nahi hai to create karo
//     if (!business) {
//       business = new Business({
//         user: userId,
//       });
//     }

//     const allowedFields = [
//       "category",
//       "workingAreas",
//       "firmName",
//       "vehicleTypes",
//       "ownerName",
//       "address",
//       "currentCity",
//       "currentState",
//       "pincode",
//       "phoneNumber",
//       "alternatePhone",
//       "email",
//       "website",
//       "socialMedia",
//       "acceptedTerms",
//       "profileCompleted",
//       "referredBy",
//     ];

//     // Sirf request me aaye fields update honge
//     allowedFields.forEach((field) => {
//       if (req.body[field] !== undefined) {
//         business[field] = req.body[field];
//       }
//     });

//     // Photo update
//     if (req.file) {
//       business.photo = {
//         public_id: req.file.filename,
//         url: req.file.path,
//       };
//     }

//     await business.save({ validateBeforeSave: false });

//     return res.status(200).json({
//       success: true,
//       message: "Profile updated successfully",
//       data: business,
//     });

//   } catch (error) {
//     console.error("Update Profile Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


const Business = require("../models/business");
const User = require("../models/register"); // User model included

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("Logged in User ID:", userId);

    // Current user ka business find karo
    let business = await Business.findOne({ user: userId });

    // Agar business nahi hai to create karo
    if (!business) {
      business = new Business({
        user: userId,
      });
    }

    const allowedFields = [
      "category",
      "workingAreas",
      "firmName",
      "vehicleTypes",
      "ownerName",
      "address",
      "currentCity",
      "currentState",
      "pincode",
      "phoneNumber",
      "alternatePhone",
      "email",
      "website",
      "socialMedia",
      "acceptedTerms",
      "profileCompleted",
      "referredBy",
    ];

    // Sirf request me aaye fields update honge
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        business[field] = req.body[field];
      }
    });

    // 👈 FIX 1: User ke role ko Business Category ke roop me sync karein (agar request me category na bheji ho)
    if (!business.category) {
      const user = await User.findById(userId).select("role");
      if (user) {
        business.category = user.role;
      }
    }

    // Photo update
    if (req.file) {
      business.photo = {
        public_id: req.file.filename,
        url: req.file.path,
      };
    }

    // 👈 FIX 2: Directory Search me Card Dikhane Ke Liye Status Complete Karein
    business.registrationStatus = "completed";
    business.isActive = true;

    // Save business data
    await business.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully and registered to Directory",
      data: business,
    });

  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};