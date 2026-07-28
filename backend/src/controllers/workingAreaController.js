const Business = require("../models/business");

exports.addWorkingAreas = async (req, res) => {
  try {
    const { workingAreas } = req.body;

    if (!workingAreas || !Array.isArray(workingAreas)) {
      return res.status(400).json({
        success: false,
        message: "Working areas are required",
      });
    }

    const business = await Business.findOne({
      user: req.user.id,
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Replace old working areas
    business.workingAreas = workingAreas;

    await business.save();

    return res.status(200).json({
      success: true,
      message: "Working areas added successfully",
      data: business.workingAreas,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};