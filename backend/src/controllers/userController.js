// controllers/userController.js
const User = require("../models/register");

exports.updateUpiId = async (req, res) => {
  try {
    const userId = req.user.id; // Auth Middleware से आया User ID
    const { upiId } = req.body;

    if (!upiId || !upiId.includes("@")) {
      return res.status(400).json({
        success: false,
        message:"please add upi id  (ex. username@upi)",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { upiId: upiId.trim() },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "UPI ID add successfully!",
      upiId: updatedUser.upiId,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};