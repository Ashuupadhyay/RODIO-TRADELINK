const Business = require("../models/business");

// Search by Line From, Line To & Vehicle Type
exports.searchBusiness = async (req, res) => {
  try {
    const { state, city, category } = req.query;

    let filter = {};

    if (state) {
      filter.state = state;
    }

    if (city) {
      filter.city = city;
    }

    if (category) {
      filter.category = category;
    }

    const businesses = await Business.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: businesses.length,
      data: businesses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};