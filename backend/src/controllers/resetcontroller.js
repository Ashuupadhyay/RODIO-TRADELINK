const bcrypt = require("bcrypt");
const User = require("../models/register");

const resetPassword = async (req, res) => {
  try {

    console.log("===== RESET PASSWORD API =====");

    const { email, password, confirmPassword } = req.body;

    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Confirm Password:", confirmPassword);

    if (!email || !password || !confirmPassword) {
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

    const user = await User.findOne({ email });

    console.log("User Found:", user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Hashed Password:", hashedPassword);

    user.password = hashedPassword;

    await user.save();

    console.log("Password Updated Successfully");

    return res.status(200).json({
      success: true,
      message: "Password Updated Successfully",
    });

  } catch (error) {

    console.log("RESET ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { resetPassword };