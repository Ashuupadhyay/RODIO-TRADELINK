const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Transporter route working"
  });
});

const {
  getTransporterById,
} = require("../controllers/transportController");

router.get("/:id", getTransporterById);

module.exports = router;