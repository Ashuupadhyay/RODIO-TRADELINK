const Business = require("../models/business");

// Search by Line From, Line To & Vehicle Type
exports.searchBusiness = async (req, res) => {
  try {
    const { from, to, vehicleType } = req.query;
    console.log("aa rrha h ");
    console.log(from);
    console.log(to);
    console.log(vehicleType);

    let filter = {
      category: "Transporter"
    };

    if (from) {
      filter.from = from;
    }

    if (to) {
      filter.to = to;
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

    console.log("aa rrha h 222222 ");
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};