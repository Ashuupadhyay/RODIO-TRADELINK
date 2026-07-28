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

    const business = await Business.findOneAndUpdate(
      { user: req.user.id },
      {
        $set: {
          workingAreas,
        },
      },
      {
        new: true,
        runValidators: false,
      }
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Working areas updated successfully",
      data: business.workingAreas,
    });
  } catch (err) {
    console.error("Working Area Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};