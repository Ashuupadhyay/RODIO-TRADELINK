const express = require("express");
const router = express.Router();

const auth = require("../middlewhere/auth");

const upload = require("../middlewhere/multer");

const {
    createBusiness,
    searchBusiness,
    getAllBusiness/*
    saveDraft,
    getDraft,
    deleteDraft,
     activateBusiness,*/
} = require("../controllers/businesscontroller");

router.get("/business", getAllBusiness);

router.post(
    "/registerbusiness",
    auth,
    upload.fields([
        { name: "photo", maxCount: 1 },
        { name: "aadhaar", maxCount: 1 },
        { name: "panCard", maxCount: 1 },
        { name: "gumasta", maxCount: 1 },
        { name: "gstCertificate", maxCount: 1 }
    ]),
    createBusiness
);

router.get("/search", searchBusiness);
/*
router.post("/draft", auth, saveDraft);
router.get("/draft", auth, getDraft);
router.delete("/draft", auth, deleteDraft);
router.patch("/activate", auth, activateBusiness);*/

module.exports = router;