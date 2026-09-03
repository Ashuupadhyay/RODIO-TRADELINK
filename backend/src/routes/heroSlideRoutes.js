const express = require("express");
const router = express.Router();
const heroSlideController = require("../controllers/heroSlideController");

// Public (Frontend carousel ke liye)
router.get("/active", heroSlideController.getActiveSlides);

// Admin Control Panel ke liye (yahan apna admin auth middleware add kar sakte hain)
router.get("/admin/all", heroSlideController.getAllAdminSlides);
router.post("/admin/create", heroSlideController.createSlide);
router.patch("/admin/toggle/:id", heroSlideController.toggleSlideStatus);
router.delete("/admin/delete/:id", heroSlideController.deleteSlide);

module.exports = router;