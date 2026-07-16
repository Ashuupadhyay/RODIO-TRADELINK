const Transporter = require("../models/business");

const getTransporterById = async (req, res) => {
  try {

    const transporter = await Transporter.findById(req.params.id);
    console.log("transporter",transporter);

    if (!transporter) {
      return res.status(404).json({
        success: false,
        message: "Transporter not found",
      });
    }

    res.status(200).json({
      success: true,
      data: transporter,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {
  getTransporterById,
};