//const sendEmail = require("../utills/sendemail");
const User = require("../models/register");
const OTP = require("../models/otpmodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../services/emailService");
const Business = require("../models/business");

// REGISTER
const register = async (req, res) => {
    try {
        const { role,name, email,mobile, password, confirmPassword } = req.body;
        console.log(role);
        console.log(name);
        console.log(email);
        console.log(mobile);
        console.log(password);
        console.log(confirmPassword);


        

        if (!role||!name || !email ||!mobile|| !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }
//Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
    return res.status(400).json({
        success: false,
        message: "Invalid email address"
    });
}

// Indian Mobile Validation
const mobileRegex = /^(?:\+91|91)?[6-9]\d{9}$/;

if (!mobileRegex.test(mobile)) {
    return res.status(400).json({
        success: false,
        message: "Please enter a valid Indian mobile number"
    });
}


        

       // Duplicate Check
// Duplicate Check
const existingUser = await User.findOne({
    $or: [
        { email: email.toLowerCase() },
        { mobile: mobile.replace(/^(\+91|91)/, "") }
    ]
});

if (existingUser) {

    if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({
            success: false,
            message: "Email is already registered"
        });
    }

    if (existingUser.mobile === mobile.replace(/^(\+91|91)/, "")) {
        return res.status(400).json({
            success: false,
            message: "Mobile number is already registered"
        });
    }

}

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            role,
            name,
            email,
            mobile,
            password: hashedPassword
        });

        await user.save();
        console.log("successfully registered");
  console.log("chal rha h 1");
        await sendEmail(email, "Successfully Registered to Rodio",
            
`  
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Welcome to Rodio</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">

<table width="100%" cellspacing="0" cellpadding="0" style="padding:40px 0;">
<tr>
<td align="center">

<table width="650" cellspacing="0" cellpadding="0"
style="background:#ffffff;border-radius:15px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,.08);">

<!-- Header -->
<tr>
<td align="center"
style="padding:35px;background:linear-gradient(90deg,#0c30c8,#ff5c00);">

<img
  src="https://res.cloudinary.com/tyt9mt1f/image/upload/v1783834638/WhatsApp_Image_2026-07-03_at_5.58.58_PM_qmgv73.jpg"
  alt="Rodio Logo"
  width="220"
  style="display:block;margin:0 auto;"
>

<h1 style="margin:15px 0 5px;color:white;">
Welcome to Rodio
</h1>


</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:40px;">

<h2 style="margin-top:0;color:#0c30c8;">
Dear ${name},
</h2>

<p style="font-size:16px;color:#555;line-height:28px;">

<p>Thank you for registering with Rodio</p>
 
Your account has been successfully registered with
<b>Rodio.</b>

</p>
<h2 style="color:#0c30c8;margin:25px 0 15px;">
    Registration Details
</h2>
<table width="100%" cellspacing="0" cellpadding="12"
style="margin:30px 0;border:1px solid #eee;border-radius:8px;">



<tr>
<td style="background:#f8f8f8;width:160px;">
<b>Name</b>
</td>

<td>${name}</td>
</tr>

<tr>
<td style="background:#f8f8f8;">
<b>Email</b>
</td>

<td>${email}</td>
</tr>

<tr>
<td style="background:#f8f8f8;">
<b>Mobile</b>
</td>

<td>${mobile}</td>
</tr>

<tr>
<td style="background:#f8f8f8;">
<b>Status</b>
</td>

<td style="color:green;">
✔ Registration Successful
</td>
</tr>

</table>

<p style="font-size:15px;color:#666;line-height:28px;">

We appreciate your trust in Rodio and look forward to serving you.

</p>




</td>
</tr>

<!-- Footer -->

<tr>

<td align="center"
style="padding:25px;background:#fafafa;border-top:1px solid #eee;">

<p style="margin:0;font-size:14px;color:#666;">

Thank you for choosing 

<b style="color:#0c30c8;">Rodio</b>

❤️

</p>

<br>

<p style="margin:0;color:#999;font-size:13px;">

Rodio Pvt. Ltd.<br>

Indore, Madhya Pradesh, India

</p>

</td>

</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`);
console.log("chakr ha e 2");

        return res.status(201).json({
            success: true,
            message: "User Registered Successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
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
                message: "Email/Mobile and Password are required"
            });
        }

        // Email ya Mobile dono se user find karega
        const user = await User.findOne({
            $or: [
                { email: emailOrMobile.toLowerCase() },
                { mobile: emailOrMobile }
            ]
        });
   console.log("usjfb,bf",user);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not registered"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
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
// Role wise redirect path
let redirectTo = "/dashboard";
/*
switch (user.role) {
    case "user":
        redirectTo = "/dashboard";
        break;

    case "broker":
        redirectTo = "/brokerdashboard";
        break;

    case "transporter":
        redirectTo = "/transporterdashboard";
        break;

    default:
        redirectTo = "/";
}*/
// Cookie me save (optional)
res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
});


let businessId = null;
console.log("biudjfj",businessId)

if (user.role === "transporter") {

    const business = await Business.findOne({ user: user._id });
     console.log(business)
    if (business) {
        
        businessId = business._id;
        console.log(businessId);
    }
}

console.log(login);
console.log(emailOrMobile);
        console.log(password);
return res.status(200).json({
    success: true,
    message: "Login Successful",
    token,
    redirectTo,
    businessId,   // 👈 ye line add karo

    user: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        mobile: user.mobile
    }
});

//logout





    }
 catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


//logout

const logout = (req, res) => {

    res.clearCookie("token");

    return res.status(200).json({
        success: true,
        message: "Logout Successful"
    });

};


// EXPORTS (FIXED)
module.exports = {
    register,
    login,
    logout
};