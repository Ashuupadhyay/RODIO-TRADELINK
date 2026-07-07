const express = require("express");
const router = express.Router();
const auth = require("../middlewhere/auth");
const { register, login,logout} = require("../controllers/authcontroller");
const {forgotPassword} = require("../controllers/forgotPassword");
const {verifyOTP} = require("../controllers/verifyotpcontroller");

const {resetPassword} = require("../controllers/resetcontroller");
router.post("/register", register);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/verify-otp", verifyOTP);
router.post("/reset", resetPassword);
router.post("/logout", logout);
//protected rout 
router.get("/profile", auth, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Profile Accessed Successfully",
        user: req.user
    });
});

module.exports = router;