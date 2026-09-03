const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ==========================================
// GET ALL USERS
// ==========================================

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};


// ==========================================
// ADD USER
// ==========================================

const addUser = async (req, res) => {
  try {
    const {
      role,
      mobile,
      password,
      firmName,
      upiId,
    } = req.body;

    // Required fields
    if (!role || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Role, mobile and password are required",
      });
    }

    // Check existing mobile
    const existingUser = await User.findOne({ mobile });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      role,
      mobile,
      password: hashedPassword,
      firmName: firmName || "",
      upiId: upiId || null,
    });

    // Don't send password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userResponse,
    });

  } catch (error) {
    console.error("Add user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE USER
// ==========================================

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const {
      role,
      mobile,
      password,
      firmName,
      upiId,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (role) user.role = role;
    if (mobile) user.mobile = mobile;
    if (firmName !== undefined) user.firmName = firmName;
    if (upiId !== undefined) user.upiId = upiId;

    // Password only if admin entered new password
    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: userResponse,
    });

  } catch (error) {
    console.error("Update user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};


// ==========================================
// DELETE USER
// ==========================================

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};


module.exports = {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser,
};