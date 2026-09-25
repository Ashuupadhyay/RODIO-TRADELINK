const express = require("express");

const protect=require("../middlewhere/protectAPi");

const router = express.Router();

const heroSlideController = require("../controllers/heroSlideController");
const { upload } = require("../config/cloudnary");

// ==========================================
// PUBLIC - FRONTEND CAROUSEL
// ==========================================
router.get(
  "/active",
  protect,
  heroSlideController.getActiveSlides
);


// ==========================================
// ADMIN - GET ALL SLIDES
// ==========================================
router.get(
  "/admin/all",
  protect,
  heroSlideController.getAllAdminSlides
);


// ==========================================
// ADMIN - CREATE SLIDE
// Desktop + Mobile Image
// ==========================================
router.post(
  "/admin/create",

  upload.fields([
    {
      name: "desktopImage",
      maxCount: 1,
    },
    {
      name: "mobileImage",
      maxCount: 1,
    },
  ]),

  heroSlideController.createSlide
);


// ==========================================
// ADMIN - TOGGLE SLIDE
// ==========================================
router.patch(
  "/admin/toggle/:id",
  protect,
  heroSlideController.toggleSlideStatus
);


// ==========================================
// ADMIN - DELETE SLIDE
// ==========================================
router.delete(
  "/admin/delete/:id",
  protect,
  heroSlideController.deleteSlide
);


module.exports = router;