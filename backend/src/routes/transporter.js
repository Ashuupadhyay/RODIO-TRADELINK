// const express = require("express");
// const router = express.Router();

// router.get("/test", (req, res) => {
//   res.json({
//     success: true,
//     message: "Transporter route working"
//   });
// });

// const {
//   getTransporterById,
// } = require("../controllers/transportController");

// router.get("/:id", getTransporterById);

// module.exports = router;


const express = require("express");
const router = express.Router();
const { getTransporterById } = require("../controllers/transportController");

// Health check route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Transporter route working",
  });
});

// Fetch business / transporter details by ID
router.get("/:id", getTransporterById);

module.exports = router;