const express = require("express");
const protect=require("../middlewhere/protectAPi");
const router = express.Router();
const upload = require("../middlewhere/multer");
const auth = require("../middlewhere/auth");

const { getProfile, updateProfile } = require("../controllers/profileController");

router.get("/", protect,auth, getProfile);
router.put("/",protect, auth, upload.single("profileImage"), updateProfile);
module.exports = router;