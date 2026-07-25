const express = require("express");
const router = express.Router();

const {updateProfile} = require("../controllers/updateProfile");
const auth  = require("../middlewhere/auth");
const upload = require("../middlewhere/multer");

router.patch(
  "/",
  auth,
  upload.single("photo"),
  updateProfile
);

module.exports = router;