//const sendEmail = require("../utills/sendemail");
const User = require("../models/register");
const OTP = require("../models/otpmodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Business = require("../models/business");

// REGISTER
// REGISTER
const register = async (req, res) => {
  try {
    const { role, firmName, mobile, password, confirmPassword, name } = req.body;

    const allowedRoles = [
      "user",
      "transporter",
      "fleet_owner",
      "cha_agent",
      "courier",
      "bus_service",
      "travel_taxi",
      "truck_body_builder",
      "rto_agent",
      "finance_company",
      "finance_agent",
      "packers_movers",
      "insurance_company",
      "car_carrier",
      "miningvehicle_supplier",
      "partstypesbettry_supplier",
      "mechanic and service center",
      "biketexiauto",
      "candfagent",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Required fields check
    if (!role || !firmName || !mobile || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Indian Mobile Validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Indian mobile number",
      });
    }

    // Duplicate Check
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. User Save (Sirf Ek Baar)
    const user = await User.create({
      role,
      firmName,
      mobile,
      password: hashedPassword,
    });

    // 2. 🟢 Business Directory Card Auto-Create
//     const business = await Business.create({
//       user: user._id,
//       category: user.role,
//       firmName: user.firmName || `${user.mobile} - Business`,
//       name: name || user.firmName || "Business Owner",
//       phoneNumber: user.mobile,
//       email: user.email || "",
//       address: "",
//       currentCity: "",
//       currentState: "",
//       pincode: "000000",
//       registrationStatus: "draft",
//       subscriptionStatus: "pending",
//       profileUnlocked: false,
//       isActive: true, 
//       isVerified: false,
//   verifiedAt: null,
//   verifiedBy: null,

// // Direct directory me dikhega
//     });
let business = null;

if (user.role !== "user") {
  business = await Business.create({
    user: user._id,
    category: user.role,
    firmName: user.firmName || `${user.mobile} - Business`,
    name: name || user.firmName || "Business Owner",
    phoneNumber: user.mobile,
    email: user.email || "",
    address: "",
    currentCity: "",
    currentState: "",
    pincode: "000000",
    registrationStatus: "draft",
    subscriptionStatus: "pending",
    profileUnlocked: false,
    isActive: true,
    isVerified: false,
    verifiedAt: null,
    verifiedBy: null,
  });
}

    console.log("Successfully registered & Business Card created");

    // JWT Token Generation
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

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    let isSubscriptionActive = false;
    if (user.role !== "user") {
      const now = new Date();
      if (
        user.subscription?.status === "active" &&
        user.subscription?.endDate &&
        new Date(user.subscription.endDate) > now
      ) {
        isSubscriptionActive = true;
      }
    }

    // Response Payload
    return res.status(201).json({
      success: true,
      message: "Registration Successful",
      token,
      redirectTo: "/",
      businessId: business._id, // 👈 Auto-created Business ki ID
      isSubscriptionActive,
      subscription: user.role !== "user" ? user.subscription : null,
      user: {
        id: user._id,
        role: user.role,
        firmName: user.firmName,
        mobile: user.mobile,
        token: token,
        businessId: business._id,
isVerified: business.isVerified,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message:
        "We couldn't process your request at the moment. Please try again later. If the problem continues, contact our support team.",
    });
  }
};
// // REGISTER
// const register = async (req, res) => {
//     try {
//        const { role, firmName, mobile, password, confirmPassword } = req.body;
//         console.log(role);
//         console.log(mobile);
//         console.log(password);
//         console.log(confirmPassword);

//         const allowedRoles = [
//             "user",
//             "transporter",
//             "fleet_owner",
//             "cha_agent",
//             "courier",
//             "bus_service",
//             "travel_taxi",
//             "truck_body_builder",
//             "rto_agent",
//             "finance_company",
//             "finance_agent",
//             "packers_movers",
//             "insurance_company",
//             "car_carrier",
//             "miningvehicle_supplier",
//             "partstypesbettry_supplier",
//             "mechanic and service center",
//             "biketexiauto",
//             "candfagent",
//         ];

//         if (!allowedRoles.includes(role)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid role",
//             });
//         }

//         // Required fields check
//         if (!role || !firmName || !mobile || !password || !confirmPassword) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "All fields are required" 
//             });
//         }

//         if (password !== confirmPassword) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Passwords do not match" 
//             });
//         }

//         // Indian Mobile Validation
//         const mobileRegex = /^[6-9]\d{9}$/;
//         if (!mobileRegex.test(mobile)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please enter a valid Indian mobile number"
//             });
//         }

//         // Duplicate Check
//         const existingUser = await User.findOne({ mobile });
//         if (existingUser) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Mobile number is already registered"
//             });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         // User save
//         const user = new User({
//     role,
//     firmName,
//     mobile,
//     password: hashedPassword
// });

//         await user.save();
//         // 1. User Register hua
// const newUser = await User.create({
//   role,
//   mobile,
//   password: hashedPassword,
//   firmName: firmName || "",
//   name: name || "",
// });

// // 2. 🟢 NEW: Direct Directory Card create kar do (Basic details ke sath)
// await Business.create({
//   user: newUser._id,
//   category: newUser.role,
//   firmName: newUser.firmName || `${newUser.mobile} - Business`,
//   name: newUser.name || "Business Owner",
//   phoneNumber: newUser.mobile,
//   email: newUser.email || "",
//   address: "Not Provided",
//   currentCity: "Not Specified",
//   currentState: "Not Specified",
//   pincode: "000000",
//   registrationStatus: "draft",       // Abhi registration draft hai
//   subscriptionStatus: "pending",     // Payment abhi baki hai
//   profileUnlocked: false,            // Profile locked rahegi (Extra details ke liye)
//   isActive: true,                    // Directory me dikhne ke liye Active
// });
//         console.log("successfully registered");

//         // Token Generation
//         const token = jwt.sign(
//             {
//                 id: user._id,
//                 role: user.role,
//             },
//             process.env.JWT_SECRET,
//             {
//                 expiresIn: process.env.JWT_EXPIRE,
//             }
//         );

//         res.cookie("token", token, {
//             httpOnly: true,
//             secure: false,
//             sameSite: "lax",
//             maxAge: 7 * 24 * 60 * 60 * 1000,
//         });

//         // 1. Business ID check (Naye user ke paas abhi business nahi hoga, par consistency ke liye null rakha hai)
//         let businessId = null;

//         // 2. Subscription active status check (Same logic as Login)
//         let isSubscriptionActive = false;

//         if (user.role !== "user") {
//             const now = new Date();
//             if (
//                 user.subscription?.status === "active" &&
//                 user.subscription?.endDate &&
//                 new Date(user.subscription.endDate) > now
//             ) {
//                 isSubscriptionActive = true;
//             }
//         }

//         // 3. Response payload - Ab yeh LOGIN wale payload se 100% match karta hai
//         return res.status(201).json({
//             success: true,
//             message: "Registration Successful",
//             token,
//             redirectTo: "/",
//             businessId,
//             isSubscriptionActive, // 👈 Frontend ko turant batayega ki active hai ya nahi
//             subscription: user.role !== "user" ? user.subscription : null, // 👈 Subscription detail bhej di
//            user: {
//     id: user._id,
//     role: user.role,
//     firmName: user.firmName,
//     mobile: user.mobile,
//     token:token,
    
// }
//         });

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ 
//             success: false, 
//             message: "We couldn't process your request at the moment. Please try again later. If the problem continues, contact our support team." 
//         });
//     }
// };
// const register = async (req, res) => {
//     try {
//         const { role, mobile, password, confirmPassword } = req.body;
        
//         console.log(role);
//         console.log(mobile);
//         console.log(password);
//         console.log(confirmPassword);
//         const allowedRoles = [
//     "user",
//     "transporter",
//     "fleet_owner",
//     "cha_agent",
//     "courier",
//     "bus_service",
//     "travel_taxi",
//     "truck_body_builder",
//     "rto_agent",
//     "finance_company",
//     "finance_agent",
// "packers_movers",
// "insurance_company",
//  "car_carrier",
//  "miningvehicle_supplier",
//  "partstypesbettry_supplier",
//  "mechanic and service center",
//  "biketexiauto",
//  "candfagent",
// ];

// if (!allowedRoles.includes(role)) {
//     return res.status(400).json({
//         success: false,
//         message: "Invalid role",
//     });
// }

//         // Required fields check (Name & Email removed)
//         if (!role || !mobile || !password || !confirmPassword) {
//             return res.status(400).json({ success: false, message: "All fields are required" });
//         }

//         if (password !== confirmPassword) {
//             return res.status(400).json({ success: false, message: "Passwords do not match" });
//         }

//         // Indian Mobile Validation
//         const mobileRegex = /^[6-9]\d{9}$/;

//         if (!mobileRegex.test(mobile)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please enter a valid Indian mobile number"
//             });
//         }

//         // Duplicate Check (Only for Mobile)
//        /*const existingUser = await User.findOne({
//             mobile: mobile.replace(/^(\+91|91)/, "")
//         });
// */
// const existingUser = await User.findOne({
//     mobile
// });
//         if (existingUser) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Mobile number is already registered"
//             });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         // User save (Name & Email removed)
//         const user = new User({
//             role,
//            mobile,
//             password: hashedPassword
//         });

//         await user.save();
//         console.log("successfully registered");

//         // Token Generation
//         const token = jwt.sign(
//             {
//                 id: user._id,
//                 role: user.role,
//             },
//             process.env.JWT_SECRET,
//             {
//                 expiresIn: process.env.JWT_EXPIRE,
//             }
//         );
//         console.log(token);

//         res.cookie("token", token, {
//             httpOnly: true,
//             secure: false,
//             sameSite: "lax",
//             maxAge: 7 * 24 * 60 * 60 * 1000,
//         });

//         return res.status(201).json({
//             success: true,
//             message: "Registration Successful",
//             token,
//             redirectTo: "/",
//             user: {
//                 id: user._id,
//                 role: user.role,
//                 mobile: user.mobile
//             }
//         });

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ success: false, message: "We couldn't process your request at the moment. Please try again later. If the problem continues, contact our support team." });
//     }
// };


// LOGIN



// LOGIN
const login = async (req, res) => {
    try {
        const { emailOrMobile, password } = req.body;

        if (!emailOrMobile || !password) {
            return res.status(400).json({
                success: false,
                message: "Mobile and Password are required"
            });
        }

        // User Find (By Mobile or Email)
        const user = await User.findOne({
            $or: [
                { email: emailOrMobile.toLowerCase() },
                { mobile: emailOrMobile }
            ]
        });

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

        let redirectTo = "/";

        // Cookie save
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        let businessId = null;

        const businessRoles = [
            "transporter",
            "fleet_owner",
            "cha_agent",
            "courier",
            "bus_service",
            "travel_taxi",
            "truck_body_builder",
            "rto_agent",
            "finance_company",
            "finance_agent",
            "packers_movers", // 👈 Fixed spelling to match schema
            "insurance_company",
            "car_carrier",
            "miningvehicle_supplier",
            "partstypesbettry_supplier",
            "mechanic and service center",
            "biketexiauto",
            "candfagent",
        ];

        if (businessRoles.includes(user.role)) {
            const business = await Business.findOne({
                user: user._id,
            });

            if (business) {
                businessId = business._id;
            }
        }

        // 👈 Subscription active status check
        let isSubscriptionActive = false;

        if (user.role !== "user") {
            const now = new Date();
            if (
                user.subscription?.status === "active" &&
                user.subscription?.endDate &&
                new Date(user.subscription.endDate) > now
            ) {
                isSubscriptionActive = true;
            }
        }

        // Clean Response
        return res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            redirectTo,
            businessId,
            isSubscriptionActive, // 👈 Active status boolean
            subscription: user.role !== "user" ? user.subscription : null, // 👈 Full subscription object (User ko chhod kar)
            user: {
                id: user._id,
                role: user.role,
                firmName:user.firmName,
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
// const login = async (req, res) => {
//     try {
//         const { emailOrMobile, password } = req.body;
//         console.log("data k pehle check");
//         console.log(emailOrMobile);
//         console.log(password);

//         if (!emailOrMobile || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Mobile and Password are required"
//             });
//         }

//         // User Find (By Mobile)
//         const user = await User.findOne({
//             $or: [
//                 { email: emailOrMobile.toLowerCase() }, // Safe fall-back if older records exist
//                 { mobile: emailOrMobile }
//             ]
//         });

//         console.log("user check:", user);
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not registered"
//             });
//         }

//         const isMatch = await bcrypt.compare(password, user.password);

//         if (!isMatch) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Wrong Password"
//             });
//         }

//         // JWT Generate
//         const token = jwt.sign(
//             {
//                 id: user._id,
//                 role: user.role
//             },
//             process.env.JWT_SECRET,
//             {
//                 expiresIn: process.env.JWT_EXPIRE
//             }
//         );

//         let redirectTo = "/";

//         // Cookie save
//         res.cookie("token", token, {
//             httpOnly: true,
//             secure: false,
//             sameSite: "lax",
//             maxAge: 7 * 24 * 60 * 60 * 1000
//         });

//         let businessId = null;

//         const businessRoles = [
//     "transporter",
//     "fleet_owner",
//     "cha_agent",
//     "courier",
//     "bus_service",
//     "travel_taxi",
//     "truck_body_builder",
//     "rto_agent",
//     "finance_company",
//     "finance_agent",
// "packers and movers",
// "insurance_company",
// "car_carrier",
// "miningvehicle_supplier",
//  "partstypesbettry_supplier",
//  "mechanic and service center",
//  "biketexiauto",
//  "candfagent",


// ];

// if (businessRoles.includes(user.role)) {
//     const business = await Business.findOne({
//         user: user._id,
//     });


    

//     if (business) {
//         businessId = business._id;
//     }
// }

// let isSubscriptionActive = false;

// /*
//         if (user.role === "broker" || user.role === "transporter") {
//             const business = await Business.findOne({
//                 user: user._id,
//             });
//             if (business) {
//                 businessId = business._id;
//             }
//         }
// */
//         return res.status(200).json({
//             success: true,
//             message: "Login Successful",
//             token,
//             redirectTo,
//             businessId,
//             subscription: user.role !== "user" ? user.subscription : null,
//             user: {
//                 id: user._id,
//                 role: user.role,
//                 mobile: user.mobile
//             },
//             user: {
//                 id: user._id,
//                 role: user.role,
//                 mobile: user.mobile
//             }
//         });

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             message: "We couldn't process your request at the moment. Please try again later. If the problem continues, contact our support team."
//         });
//     }
// };


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