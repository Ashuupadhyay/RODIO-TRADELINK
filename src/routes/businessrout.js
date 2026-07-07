const express = require("express");
const router = express.Router();

const upload = require("../middlewhere/multer");
const { registerBusiness } = require("../controllers/businesscontroller");

router.post(
    "/registerbusiness",
    upload.single("verificationDocument"),
    registerBusiness
);

module.exports = router;