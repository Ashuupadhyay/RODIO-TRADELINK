const express = require("express");

const router = express.Router();

const heroSlideController = require("../controllers/heroSlideController");
const { upload } = require("../config/cloudnary");

// ==========================================
// PUBLIC - FRONTEND CAROUSEL
// ==========================================
router.get(
  "/active",
  heroSlideController.getActiveSlides
);


// ==========================================
// ADMIN - GET ALL SLIDES
// ==========================================
router.get(
  "/admin/all",
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
  heroSlideController.toggleSlideStatus
);


// ==========================================
// ADMIN - DELETE SLIDE
// ==========================================
router.delete(
  "/admin/delete/:id",
  heroSlideController.deleteSlide
);


module.exports = router;