const express = require("express");

const router = express.Router();
const upload = require("../middlewhere/multer");
const auth = require("../middlewhere/auth");

const { getProfile, updateProfile } = require("../controllers/profileController");

router.get("/", auth, getProfile);
router.put("/", auth, upload.single("profileImage"), updateProfile);
module.exports = router;