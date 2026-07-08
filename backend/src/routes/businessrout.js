const express = require("express");
const router = express.Router();

const upload = require("../middlewhere/multer");
const { createBusiness,searchBusiness } = require("../controllers/businesscontroller");

router.post(
    "/registerbusiness",
    upload.single("verificationDocument"),
    createBusiness
);
router.get("/search", searchBusiness);

module.exports = router;