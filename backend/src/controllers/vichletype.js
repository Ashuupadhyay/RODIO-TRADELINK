const Business = require("../models/business");

exports.searchBusiness = async (req, res) => {
  try {
    const { from, to, vehicleType } = req.query;

    let filter = {};

    // From City
    if (from && from.trim() !== "") {
      filter.from = {
        $regex: new RegExp("^" + from.trim() + "$", "i"),
      };
    }

    // To City
    if (to && to.trim() !== "") {
      filter.to = {
        $regex: new RegExp("^" + to.trim() + "$", "i"),
      };
    }

    // Vehicle Type
    if (vehicleType && vehicleType.trim() !== "") {
      filter.vehicleTypes = {
        $in: vehicleType
          .split(",")
          .map((item) => new RegExp("^" + item.trim() + "$", "i")),
      };
    }

    console.log("Search Filter:", filter);

    const businesses = await Business.find(filter).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      total: businesses.length,
      data: businesses,
    });
  } catch (error) {
    console.error("Search Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};