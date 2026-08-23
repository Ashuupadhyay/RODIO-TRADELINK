const express = require("express");

const router = express.Router();

const {
  getAdminUsers,
  resetUserPassword,
} = require("../controllers/adminUserController");

// Get all users
router.get("/users", getAdminUsers);

// Reset password
router.put("/users/:userId/password", resetUserPassword);

module.exports = router;