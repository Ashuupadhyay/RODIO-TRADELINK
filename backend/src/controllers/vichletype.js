const Business = require("../models/business");

exports.searchBusiness = async (req, res) => {
  try {
    const { state, city, category } = req.query;

    console.log("Query Params:", req.query);

    let filter = {};

    // State Filter
    if (state && state.trim() !== "") {
      filter.state = state;
    }

    // City Filter
    if (city && city.trim() !== "") {
      filter.city = city;
    }

    // Category Filter
    if (category && category.trim() !== "") {
      filter.category = category;
    }

    console.log("Mongo Filter:", filter);

    const businesses = await Business.find(filter).sort({ createdAt: -1 });

    console.log("Found Businesses:", businesses.length);

    res.status(200).json({
      success: true,
      count: businesses.length,
      data: businesses,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};