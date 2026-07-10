const Business = require("../models/business");

// Search by Line From, Line To & Vehicle Type
exports.searchBusiness = async (req, res) => {
  try {
    const { linefrom, lineto, vehicleType } = req.query;

    let filter = {
      category: "Transporter"
    };

    if (linefrom) {
      filter.linefrom = linefrom;
    }

    if (lineto) {
      filter.lineto = lineto;
    }

    if (vehicleType) {
      filter.vehicleTypes = vehicleType;
    }

    const businesses = await Business.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: businesses.length,
      data: businesses
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};